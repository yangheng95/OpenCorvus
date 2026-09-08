import fs from "node:fs/promises"
import path from "node:path"
import { Config } from "@/config/config"
import { EngineTaskTable } from "@/engine/engine.sql"
import { appendTaskOpenedInTransaction } from "@/engine/task-lifecycle"
import { Identifier } from "@/id/id"
import { ensureMissionSession } from "@/mission/session"
import { openMissionExecutionWithWake, missionOperatorWakeReason } from "@/mission/execution-closure"
import { Instance } from "@/project/instance"
import { ProtocolEventTable, ProtocolInboxTable } from "@/protocol/protocol.sql"
import { ProtocolStore } from "@/protocol/store"
import { sendSchedulerMessage } from "@/protocol/scheduler-message"
import { Session } from "@/session"
import { SessionWake } from "@/session/wake"
import { Database, eq } from "@/storage/db"

const [mode, directory, label, wave] = process.argv.slice(2)
if (!mode || !directory) throw new Error("Scheduler writer requires mode and isolated directory")
using _loop = SessionWake.TestHooks.installWakeLoopExecutor(async () => undefined)
try {
  const result = await Instance.provide({
    directory: path.join(directory, "project"),
    fn: async () => {
      if (mode === "seed") {
        const { missionID, mission, root, taskID } = await establishMissionTask(Instance.directory, "Scheduler writer")
        const terminal = Database.immediateTransaction(() =>
          ProtocolStore.appendEventInTransaction({
            kind: "event",
            type: "task.completed",
            aggregate: "task",
            aggregate_id: taskID,
            source: "test.scheduler-writer",
            payload: { execution_epoch: 1, summary: "Notify owning Mission" },
          }),
        )
        const message = {
          kind: "notification" as const,
          source: {
            kind: "task_scheduler" as const,
            project_id: Instance.project.id,
            task_id: taskID,
            root_session_id: root.id,
          },
          target: {
            kind: "mission_scheduler" as const,
            project_id: Instance.project.id,
            mission_id: missionID,
            session_id: mission.id,
          },
          sourceTerminalEventID: terminal.id,
        }
        await fs.writeFile(path.join(directory, "input.json"), JSON.stringify(message))
        return { taskID }
      }
      if (mode === "inspect") {
        return Database.use((db) => ({
          events: db
            .select()
            .from(ProtocolEventTable)
            .where(eq(ProtocolEventTable.type, "scheduler.message"))
            .all()
            .map((row) => ({
              id: row.id,
              invocation: (row.payload as { invocation_id: string }).invocation_id,
              subject: (row.payload as { subject: string }).subject,
            })),
          inbox: db
            .select()
            .from(ProtocolInboxTable)
            .all()
            .map((row) => ({ id: row.id, eventID: row.envelope_id })),
        }))
      }
      if (mode !== "send" || !label || !wave) throw new Error("Scheduler send worker requires label and wave")
      const message = JSON.parse(await fs.readFile(path.join(directory, "input.json"), "utf8"))
      await fs.writeFile(path.join(directory, `${wave}-${label}.ready`), "ready")
      const deadline = Date.now() + 30_000
      while (
        !(await fs.stat(path.join(directory, `${wave}.start`)).then(
          () => true,
          (error) => {
            if (error.code === "ENOENT") return false
            throw error
          },
        ))
      ) {
        if (Date.now() > deadline) throw new Error("Scheduler send barrier timed out")
        await Bun.sleep(10)
      }
      const receipts = []
      for (let index = 0; index < 50; index++) {
        const invocation = `scheduler-${label}-${index}`
        const receipt = await sendSchedulerMessage({ ...message, invocationID: invocation, subject: invocation })
        receipts.push({ invocation, eventID: receipt.eventID, inboxID: receipt.inboxID })
      }
      return receipts
    },
  })
  process.stdout.write(JSON.stringify(result))
} finally {
  await Instance.disposeAll()
  await Database.awaitEffectIdle(5000)
  Database.close()
}
async function establishMissionTask(projectPath: string, title: string) {
  await Config.updateProjectPatch({
    model: "scheduler-schema-test/scheduler-schema-model",
    provider: {
      "scheduler-schema-test": {
        name: "Scheduler schema test",
        npm: "@ai-sdk/openai-compatible",
        api: "http://127.0.0.1:9/scheduler-schema-model",
        models: {
          "scheduler-schema-model": {
            name: "Scheduler schema model",
            tool_call: true,
            modalities: { input: ["text"], output: ["text"] },
            limit: { context: 1_000_000, output: 4_096 },
          },
        },
      },
    },
  })
  const missionID = `mission-${Identifier.uuid4First8()}`
  const mission = await ensureMissionSession({
    missionID,
    defaultCwd: projectPath,
    productPillar: "code",
    heldExpertSquadIDs: ["base"],
  })

  await openMissionExecutionWithWake({
    sessionID: mission.id,
    missionID,
    source: "mission.wake",
    requestID: `scheduler-schema:${missionID}`,
    acceptedInput: {
      text: "Open the exact Mission occurrence for scheduler delivery.",
      model: null,
      attachments: [],
      configPatch: {},
      context: { surface: "test.scheduler-task-root" },
    },
    wake: (admission) =>
      SessionWake.wakeWithReceipt({
        sessionID: mission.id,
        messageID: admission.messageID,
        textPartID: admission.textPartID,
        controlID: admission.controlID,
        prompt: "Open the exact Mission occurrence for scheduler delivery.",
        author: "user",
        agent: "mission",
        surface: "panel",
        userAuthored: true,
        reason: missionOperatorWakeReason(admission, missionID),
        commitBundle: admission.commitBundle,
        preflightBundle: admission.preflightBundle,
        ownerPreflight: admission.ownerPreflight,
        ownerLifecycle: admission.ownerLifecycle,
      }),
  })
  const root = await Session.create({ kind: "root", title })
  const taskID = Identifier.ascending("task")
  const now = Date.now()
  Database.immediateTransaction((db) => {
    db.insert(EngineTaskTable)
      .values({
        id: taskID,
        project_id: Instance.project.id,
        session_id: root.id,
        source: "mission",
        product_pillar: "code",
        title,
        request: "Materialize the exact scheduler delivery reference",
        metadata: { actor: "mission", mission: { id: missionID, session_id: mission.id } },
        time_created: now,
      })
      .run()
    appendTaskOpenedInTransaction({
      db,
      taskID,
      sessionID: root.id,
      now,
      source: "test.scheduler-delivery",
    })
  })
  return { missionID, mission, root, taskID, now }
}
