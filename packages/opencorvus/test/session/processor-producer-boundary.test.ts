import { afterEach, expect, spyOn, test } from "bun:test"
import { MockLanguageModelV3, simulateReadableStream } from "ai/test"
import { tool } from "ai"
import z from "zod"
import fs from "node:fs/promises"
import path from "node:path"
import { PrimaryAssistantRegistry } from "@/agent/primary-assistant-registry"
import { sessionRuntimeFromNativeAgent } from "@/agent/session-agent-runtime"
import { Config } from "@/config/config"
import { EngineConfig } from "@/engine/config"
import { Identifier } from "@/id/id"
import { DefaultLLMActivityPolicy } from "@/llm/activity"
import { Provider } from "@/provider/provider"
import { Instance } from "@/project/instance"
import { Session } from "@/session"
import { SessionProcessor } from "@/session/processor"
import { ExecutionCancellationError, createExecutionCancellationOrigin } from "@/session/prompt/cancellation"
import { ProviderActivityOutcomeTable } from "@/session/session.sql"
import { Database } from "@/storage/db"
import { Snapshot } from "@/snapshot"
import { memoryProject, resetMemoryDatabase } from "../fixture/memory"

afterEach(async () => {
  await Instance.disposeAll()
  await resetMemoryDatabase()
})

async function processorFixture(
  run: (input: {
    directory: string
    sessionID: string
    controller: AbortController
    processor: ReturnType<typeof SessionProcessor.create>
    process: (tools: any, stream?: any) => ReturnType<ReturnType<typeof SessionProcessor.create>["process"]>
  }) => Promise<void>,
) {
  await using project = await memoryProject()
  await Instance.provide({
    directory: project.path,
    fn: async () => {
      const ref = { providerID: "producer-boundary", modelID: "deterministic" }
      await Config.updateProjectPatch({
        model: `${ref.providerID}/${ref.modelID}`,
        provider: {
          [ref.providerID]: {
            name: "Producer boundary",
            npm: "@ai-sdk/openai-compatible",
            api: "http://127.0.0.1:1/v1",
            models: {
              [ref.modelID]: {
                name: "Producer boundary",
                tool_call: true,
                modalities: { input: ["text"], output: ["text"] },
                limit: { context: 32000, output: 4096 },
              },
            },
          },
        },
      })
      const model = await Provider.getModel(ref.providerID, ref.modelID)
      const agent = sessionRuntimeFromNativeAgent(
        await PrimaryAssistantRegistry.get("coding", { config: await Config.get() }),
      )
      const session = await Session.create({ kind: "assistant", title: "Producer boundary" })
      const user = await Session.updateMessage({
        id: Identifier.ascending("message"),
        sessionID: session.id,
        role: "user",
        author: "user",
        agent: "coding",
        time: { created: Date.now() },
        model: ref,
      })
      const assistant = await Session.updateMessage({
        id: Identifier.ascending("message"),
        sessionID: session.id,
        parentID: user.id,
        role: "assistant",
        author: "coding",
        agent: "coding",
        path: { cwd: project.path, root: project.path },
        cost: 0,
        tokens: { total: 0, input: 0, output: 0, reasoning: 0, cache: { read: 0, write: 0 } },
        providerID: ref.providerID,
        modelID: ref.modelID,
        time: { created: Date.now() },
      })
      const controller = new AbortController()
      if (user.role !== "user" || assistant.role !== "assistant")
        throw new Error("Processor fixture participant roles are invalid")
      const processor = SessionProcessor.create({
        assistantMessage: assistant,
        sessionID: session.id,
        model,
        abort: controller.signal,
      })
      await run({
        directory: project.path,
        sessionID: session.id,
        controller,
        processor,
        process: (tools, stream) =>
          processor.process({
            user,
            agentID: "coding",
            agent,
            abort: controller.signal,
            sessionID: session.id,
            system: [],
            messages: [{ role: "user", content: "Commit the requested operation." }],
            tools,
            model,
            stream,
          }),
      })
    },
  })
}

test("a producer-side committed operation yields unsafe retry when its consumer stalls before tool-call", async () => {
  await processorFixture(async ({ directory, processor, process }) => {
    const effect = Promise.withResolvers<void>()
    const file = path.join(directory, "effect.txt")
    const language = new MockLanguageModelV3({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: [
            { type: "stream-start", warnings: [] },
            { type: "tool-call", toolCallId: "commit-once", toolName: "commit", input: "{}" },
          ],
        }),
      }),
    })
    const provider = spyOn(Provider, "getLanguage").mockResolvedValue(language)
    const engine = spyOn(EngineConfig, "get").mockResolvedValue({
      ...EngineConfig.defaults,
      activity: { ...EngineConfig.defaults.activity, session_llm_idle_ms: 150 },
    })
    const backoff = spyOn(DefaultLLMActivityPolicy, "backoffMs").mockReturnValue(0)
    try {
      const result = await process(
        {
          commit: tool({
            inputSchema: z.object({}),
            execute: async () => {
              await fs.appendFile(file, "committed\n")
              effect.resolve()
              return { title: "Committed", output: "Persisted one operation", metadata: {} }
            },
          }),
        },
        {
          onChunk: async ({ chunk }: any) => {
            if (chunk.type === "start-step") {
              await effect.promise
              await Bun.sleep(250)
            }
          },
        },
      )
      expect({ result, bytes: await fs.readFile(file, "utf8"), error: processor.message.error }).toMatchObject({
        result: "stop",
        bytes: "committed\n",
        error: { name: "UnknownError", data: { message: expect.stringContaining("ProcessorUnsafeRetryError") } },
      })
    } finally {
      provider.mockRestore()
      engine.mockRestore()
      backoff.mockRestore()
    }
  })
}, 30_000)

test("cancelling paused step preparation settles its activity only after the producer relinquishes it", async () => {
  await processorFixture(async ({ controller, processor, process, sessionID }) => {
    const entered = Promise.withResolvers<void>()
    const release = Promise.withResolvers<void>()
    let releasedAt = 0
    const snapshot = spyOn(Snapshot, "track").mockImplementation(async () => {
      entered.resolve()
      await release.promise
      releasedAt = Date.now()
      return undefined
    })
    const provider = spyOn(Provider, "getLanguage").mockResolvedValue(
      new MockLanguageModelV3({ doStream: async () => ({ stream: simulateReadableStream({ chunks: [] }) }) }),
    )
    try {
      const running = process({})
      await entered.promise
      controller.abort(
        new ExecutionCancellationError({
          source: "session_prompt",
          sessionID,
          message: "Cancel the paused preparation",
          origin: createExecutionCancellationOrigin({
            actor: "runtime",
            source: "process.shutdown",
            surface: "producer-test",
            reason: "Cancel the paused preparation",
            targetSessionID: sessionID,
          }),
        }),
      )
      await Bun.sleep(20)
      release.resolve()
      const result = await running
      const outcomes = Database.use((db) => db.select().from(ProviderActivityOutcomeTable).all())
      expect(outcomes[0]!.time_created).toBeGreaterThanOrEqual(releasedAt)
      expect({ result, error: processor.message.error, outcomes }).toMatchObject({
        result: "stop",
        error: { name: "MessageAbortedError" },
        outcomes: [
          expect.objectContaining({
            data: expect.objectContaining({ outcome: "aborted", error_class: "external_abort", attempt_count: 1 }),
          }),
        ],
      })
    } finally {
      release.resolve()
      snapshot.mockRestore()
      provider.mockRestore()
    }
  })
}, 30_000)
