import { describe, expect, test } from "bun:test"
import { summarizePersistedChatMessages, type PersistedChatDebugProjection } from "../src/services/session-debug"
import {
  buildChatDebugBlob,
  DebugProjectDirectoryUnavailableError,
  requireDebugProjectDirectory,
} from "../src/utils/debug-info"

function message(input: {
  id: string
  sessionID?: string
  role: "user" | "assistant"
  created: number
  completed?: number
  finish?: string
  errorName?: string
  userInput?: string
  parts?: Array<Record<string, unknown>>
}) {
  const sessionID = input.sessionID ?? "session-debug"
  return {
    info: {
      id: input.id,
      sessionID,
      role: input.role,
      time: { created: input.created, ...(input.completed ? { completed: input.completed } : {}) },
      ...(input.finish ? { finish: input.finish } : {}),
      ...(input.errorName ? { error: { name: input.errorName } } : {}),
      ...(input.userInput !== undefined
        ? {
            extra: {
              project_memory_user_input: {
                version: 1,
                surface: "session.prompt",
                literalText: input.userInput,
              },
            },
          }
        : {}),
    },
    parts: (input.parts ?? []).map((part, index) => ({
      id: `${input.id}-part-${index}`,
      sessionID,
      messageID: input.id,
      ...part,
    })),
  }
}

function projection(input: {
  root: ReturnType<typeof summarizePersistedChatMessages>
  tree?: ReturnType<typeof summarizePersistedChatMessages>
  rootUnavailable?: string
}): PersistedChatDebugProjection {
  return {
    schema: "opencorvus.chat-debug.v2",
    sessionID: "session-debug",
    directory: "C:/project",
    startedAt: 1_700_000_000_000,
    completedAt: 1_700_000_000_100,
    root: input.rootUnavailable
      ? {
          status: "unavailable",
          endpoint: "session/session-debug/message",
          collectedAt: 1_700_000_000_050,
          error: input.rootUnavailable,
        }
      : {
          status: "available",
          endpoint: "session/session-debug/message",
          collectedAt: 1_700_000_000_050,
          summary: input.root,
        },
    tree: {
      status: "available",
      endpoint: "session/session-debug/conversation",
      collectedAt: 1_700_000_000_090,
      summary: input.tree ?? input.root,
      board: { sessionID: "session-debug", title: "Debug", status: "idle", directory: "C:/project" },
    },
  }
}

describe("persisted chat debug bundle", () => {
  test("accepts named and anonymous persisted project directories for diagnostic collection", () => {
    const message = "Debug information requires a persisted project directory."
    expect(requireDebugProjectDirectory(" C:/work/opencorvus ", message)).toBe("C:/work/opencorvus")
    expect(
      requireDebugProjectDirectory(
        "C:/Users/test/AppData/Local/opencorvus/data/projects/2026/08/11/123e4567-e89b-42d3-a456-426614174000",
        message,
      ),
    ).toBe("C:/Users/test/AppData/Local/opencorvus/data/projects/2026/08/11/123e4567-e89b-42d3-a456-426614174000")
    const missingDirectory = () => requireDebugProjectDirectory("", message)
    expect(missingDirectory).toThrow(message)
    expect(missingDirectory).toThrow(DebugProjectDirectoryUnavailableError)
  })

  test("counts validated lifecycle facts and keeps bounded Tool identities", () => {
    const stats = summarizePersistedChatMessages([
      message({
        id: "user-1",
        role: "user",
        created: 1,
        userInput: "Build a Sokoban game",
        parts: [
          { type: "text", text: "Build a Sokoban game", source: "user" },
          { type: "text", text: "private MCP resource body" },
        ],
      }),
      message({
        id: "assistant-running",
        role: "assistant",
        created: 2,
        parts: [
          { type: "tool", tool: "glob", callID: "call-glob", state: { status: "running", time: { start: 3 } } },
          { type: "tool", tool: "read", callID: "call-read", state: { status: "pending", time: { start: 3 } } },
        ],
      }),
      message({
        id: "assistant-error",
        role: "assistant",
        created: 4,
        completed: 5,
        finish: "error",
        errorName: "UnknownError",
        parts: [
          {
            type: "tool",
            tool: "bash",
            callID: "call-bash",
            state: {
              status: "error",
              time: { start: 4, end: 5 },
              failure: { kind: "process-execution-interrupted", message: "token=private diagnostic" },
            },
          },
          {
            type: "tool",
            tool: "write",
            callID: "call-write",
            state: { status: "completed", time: { start: 4, end: 5 } },
          },
        ],
      }),
    ])

    expect(stats.stats).toEqual({
      messages: {
        total: 3,
        user: 1,
        assistant: 2,
        other: 0,
        assistantIncomplete: 1,
        assistantCompleted: 1,
        assistantError: 1,
      },
      tools: { total: 4, pending: 1, running: 1, completed: 1, error: 1, other: 0 },
    })
    expect(stats.sessionIDs).toEqual(["session-debug"])
    expect(stats.recentMessages[0]).toMatchObject({
      messageID: "user-1",
      role: "user",
      userTextPreview: "Build a Sokoban game",
    })
    expect(stats.recentTools[0]).toMatchObject({
      messageID: "assistant-running",
      tool: "glob",
      status: "running",
    })
    expect(stats.recentTools[2]).toMatchObject({
      tool: "bash",
      failureKind: "process-execution-interrupted",
      failure: "token=[redacted] diagnostic",
    })
  })

  test("keeps an attachment-only user marker available without copying Host context", () => {
    const summary = summarizePersistedChatMessages([
      message({
        id: "attachment-only-user",
        role: "user",
        created: 1,
        userInput: "",
        parts: [{ type: "text", text: "Host-injected attachment contents" }],
      }),
    ])

    expect(summary.recentMessages).toEqual([
      expect.objectContaining({
        messageID: "attachment-only-user",
        role: "user",
        userTextPreview: null,
      }),
    ])
  })

  test("maps malformed and cross-Session records to explicit contract errors", () => {
    expect(() => summarizePersistedChatMessages([{}])).toThrow("Session message response[0].info must be an object")
    expect(() =>
      summarizePersistedChatMessages([
        message({ id: "missing-type", role: "assistant", created: 1, parts: [{ tool: "glob", callID: "call" }] }),
      ]),
    ).toThrow("part missing-type-part-0.type must be a non-empty string")
    expect(() =>
      summarizePersistedChatMessages([
        message({
          id: "duplicate-parts",
          role: "user",
          created: 1,
          parts: [
            { id: "duplicate-part", type: "text", text: "first" },
            { id: "duplicate-part", type: "text", text: "second" },
          ],
        }),
      ]),
    ).toThrow("contains duplicate part duplicate-part")
    expect(() =>
      summarizePersistedChatMessages([
        message({
          id: "missing-tool-time",
          role: "assistant",
          created: 1,
          parts: [{ type: "tool", tool: "glob", callID: "call", state: { status: "running" } }],
        }),
      ]),
    ).toThrow("state.time must be an object")
    expect(() =>
      summarizePersistedChatMessages([
        message({
          id: "future-tool-state",
          role: "assistant",
          created: 1,
          parts: [
            { type: "tool", tool: "glob", callID: "call", state: { status: "future-state", time: { start: 2 } } },
          ],
        }),
      ]),
    ).toThrow("has unsupported status future-state")
    expect(() =>
      summarizePersistedChatMessages([message({ id: "other", sessionID: "other-session", role: "user", created: 1 })], {
        expectedSessionID: "session-debug",
      }),
    ).toThrow("Session message other belongs to other-session, expected session-debug")
  })

  test("rejects a persisted projection owned by another Session", () => {
    const empty = summarizePersistedChatMessages([])
    const other = { ...projection({ root: empty }), sessionID: "other-session" } as PersistedChatDebugProjection
    expect(() =>
      buildChatDebugBlob(
        { sessionID: "session-debug", title: "Debug", status: "idle", directory: "C:/project" },
        { kind: "session", id: "session-debug", directory: "C:/project" },
        { cards: {}, order: [] } as any,
        other,
      ),
    ).toThrow("Chat debug persistence belongs to other-session, expected session-debug")
  })
})
