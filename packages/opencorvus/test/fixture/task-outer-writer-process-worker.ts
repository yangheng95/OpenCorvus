import fs from "node:fs"
import path from "node:path"
import { Database, and, asc, eq } from "@/storage/db"
import {
  recordMailboxMessage,
  acknowledgeMailboxItem,
  acknowledgeAllMailboxItemsRead,
  deleteMailboxItems,
} from "@/engine/mailbox"
import { Instance } from "@/project/instance"
import { Session } from "@/session"
import { Identifier } from "@/id/id"
import {
  EngineTaskTable,
  EngineArtifactTable,
  EngineBrowserPreviewTargetIdentityTable,
  EngineTaskRootIngressTable,
} from "@/engine/engine.sql"
import { persistProcessShutdownRecoveryHandoffs } from "@/engine/task-root-ingress-delivery"
import { persistBrowserPreviewTarget, promoteBrowserPreviewTarget } from "@/browser-preview/persist"
import { appendTaskOpenedInTransaction } from "@/engine/task-lifecycle"
import { recordEngineArtifact, updateEngineArtifact } from "@/engine/artifact"
import { rewindTask, clearRewindCursor, taskRewindCursor } from "@/engine/rewind"
import { ProtocolEventTable } from "@/protocol/protocol.sql"
import { updateTask } from "@/engine/state"
import { requireTask } from "@/engine/store"
import { AttachmentStore } from "@/storage/attachment-store"
import {
  acquireTaskCompletionClosureInTransaction,
  releaseTaskCompletionClosureInTransaction,
} from "@/engine/task-completion-closure"
import {
  appendTaskAttachment,
  appendTaskSystemArtifact,
  replaceTaskSystemArtifactByIntent,
  type TaskFileRef,
} from "@/engine/task-file-reference"

const [mode, directory, label] = process.argv.slice(2)
if (!mode || !directory) throw new Error("Task writer worker requires mode and directory")
const project = path.join(directory, "project")
fs.mkdirSync(project, { recursive: true })
try {
  await Instance.provide({
    directory: project,
    fn: async () => {
      const inputPath = path.join(directory, "input.json")
      if (mode === "init") {
        const session = await Session.create({ kind: "root", title: "Concurrent outer writers" })
        const taskID = Identifier.ascending("task")
        const now = Date.now()
        Database.immediateTransaction((db) => {
          db.insert(EngineTaskTable)
            .values({
              id: taskID,
              project_id: Instance.project.id,
              session_id: session.id,
              source: "test",
              product_pillar: "code",
              title: "Concurrent outer writers",
              request: "Verify atomic receipts",
              time_created: now,
            })
            .run()
          appendTaskOpenedInTransaction({ db, taskID, sessionID: session.id, now, source: "test.outer-writer" })
        })
        const artifacts = Array.from({ length: 4 }, (_, index) =>
          recordEngineArtifact({
            taskID,
            kind: "expert_output",
            label: `worker-${index}`,
            payload: { index },
          }),
        )
        fs.writeFileSync(inputPath, JSON.stringify({ taskID, sessionID: session.id, artifacts }))
        return
      }
      const { taskID, sessionID, artifacts, files, completionTasks } = JSON.parse(
        fs.readFileSync(inputPath, "utf8"),
      ) as {
        taskID: string
        sessionID: string
        artifacts: string[]
        files?: TaskFileRef[]
        completionTasks?: Array<{ taskID: string; sessionID: string }>
      }
      if (mode === "completion-seed") {
        const completionTasks = []
        for (let index = 0; index < 4; index++) {
          const root = await Session.create({ kind: "root", title: `Completion writer ${index}` })
          const id = Identifier.ascending("task")
          const now = Date.now()
          Database.immediateTransaction((db) => {
            db.insert(EngineTaskTable)
              .values({
                id,
                project_id: Instance.project.id,
                session_id: root.id,
                source: "test",
                product_pillar: "code",
                title: "Completion writer",
                request: "Verify closure writer",
                time_created: now,
              })
              .run()
            appendTaskOpenedInTransaction({ db, taskID: id, sessionID: root.id, now, source: "test.completion-writer" })
          })
          completionTasks.push({ taskID: id, sessionID: root.id })
        }
        fs.writeFileSync(inputPath, JSON.stringify({ taskID, sessionID, artifacts, files, completionTasks }))
        return
      }
      if (mode === "file-seed") {
        const files: TaskFileRef[] = []
        for (let index = 0; index < 100; index++) {
          files.push(
            await AttachmentStore.write(
              Instance.project.id,
              Buffer.from(`Task file ${index}`),
              "text/plain",
              `file-${index}.txt`,
            ),
          )
        }
        fs.writeFileSync(inputPath, JSON.stringify({ taskID, sessionID, artifacts, files }))
        console.log(JSON.stringify(files))
        return
      }
      if (mode === "inspect") {
        const events = Database.use((db) =>
          db
            .select({ id: ProtocolEventTable.id, type: ProtocolEventTable.type, payload: ProtocolEventTable.payload })
            .from(ProtocolEventTable)
            .where(eq(ProtocolEventTable.aggregate_id, taskID))
            .orderBy(asc(ProtocolEventTable.seq))
            .all(),
        )
        const rows = Database.use((db) =>
          db
            .select({
              id: EngineArtifactTable.id,
              label: EngineArtifactTable.label,
              revision: EngineArtifactTable.catalog_revision,
              payload: EngineArtifactTable.payload,
              updated: EngineArtifactTable.time_updated,
            })
            .from(EngineArtifactTable)
            .where(eq(EngineArtifactTable.task_id, taskID))
            .all(),
        )
        const targets = Database.use((db) =>
          db
            .select()
            .from(EngineBrowserPreviewTargetIdentityTable)
            .where(eq(EngineBrowserPreviewTargetIdentityTable.task_id, taskID))
            .all(),
        )
        console.log(
          JSON.stringify({
            events,
            artifacts: rows,
            targets,
            title: requireTask(taskID).title,
            attachments: requireTask(taskID).attachments,
            systemArtifacts: requireTask(taskID).system_artifacts,
            cursor: taskRewindCursor(taskID),
          }),
        )
        return
      }
      const mailboxModes = [
        "mailbox-record",
        "mailbox-read",
        "mailbox-readall",
        "mailbox-archive",
        "mailbox-restore",
        "mailbox-delete",
      ]
      const fileModes = ["file-append", "file-replay", "file-artifact", "file-replace"]
      if (
        !label ||
        ![
          "rewind",
          "artifact",
          "clear",
          "preview",
          "promote",
          "state",
          "completion",
          "shutdown",
          ...mailboxModes,
          ...fileModes,
        ].includes(mode)
      )
        throw new Error("Invalid Task writer mode")
      const targetID =
        mode === "promote"
          ? Database.use(
              (db) =>
                db
                  .select()
                  .from(EngineBrowserPreviewTargetIdentityTable)
                  .where(eq(EngineBrowserPreviewTargetIdentityTable.task_id, taskID))
                  .get()!.artifact_id,
            )
          : undefined
      fs.writeFileSync(path.join(directory, `${mode}-${label}.ready`), "ready")
      const deadline = Date.now() + 30_000
      while (!fs.existsSync(path.join(directory, `${mode}.start`))) {
        if (Date.now() > deadline) throw new Error("Task writer start barrier timed out")
        await Bun.sleep(10)
      }
      const receipts: Array<{ reason: string; count: number }> = []
      if (mode === "shutdown") {
        const task = completionTasks?.[Number(label)]
        if (!task) throw new Error("Shutdown writer requires its seeded Task")
        const handoffs = Array.from({ length: 25 }, (_, index) => {
          const reason = `shutdown-${label}-${index}`
          const result = persistProcessShutdownRecoveryHandoffs({
            tasks: [{ taskID: task.taskID, ownedSessionIDs: [task.sessionID] }],
            reason,
          })
          if (result.length !== 1) throw new Error("Expected one active Task handoff")
          return { ...result[0], reason }
        })
        const persisted = Database.use((db) =>
          handoffs.map((handoff) => {
            const fact = db
              .select()
              .from(EngineArtifactTable)
              .where(eq(EngineArtifactTable.id, handoff.recoveryFactID))
              .get()
            const wake = db
              .select()
              .from(EngineTaskRootIngressTable)
              .where(eq(EngineTaskRootIngressTable.id, handoff.wakeID))
              .get()
            return {
              taskID: fact?.task_id,
              recoveryFactID: fact?.id,
              wakeID: wake?.id,
              wakeTaskID: wake?.task_id,
              source: wake?.source,
              sourceID: wake?.source_id,
              epoch: wake?.execution_epoch,
              reason: (fact?.payload as { reason?: string } | undefined)?.reason,
            }
          }),
        )
        console.log(JSON.stringify({ handoffs, persisted, previews: [] }))
        return
      }
      if (mode === "completion") {
        const task = completionTasks?.[Number(label)]
        if (!task) throw new Error("Completion writer requires its seeded Task")
        const ownerID = `completion-${label}`
        const closures = []
        for (let index = 0; index < 25; index++) {
          const acquired = Database.immediateTransaction((db) =>
            acquireTaskCompletionClosureInTransaction(db, {
              taskID: task.taskID,
              ownerID,
              orchestratorSessionID: task.sessionID,
              orchestratorMessageID: Identifier.ascending("message"),
              toolCallID: `call-${index}`,
              toolPartID: Identifier.ascending("part"),
              timeAcquired: Date.now(),
            }),
          )
          const released = Database.immediateTransaction((db) =>
            releaseTaskCompletionClosureInTransaction(db, { taskID: task.taskID, ownerID }),
          )
          closures.push({ ownerID: acquired.owner_id, released })
        }
        console.log(JSON.stringify({ closures, previews: [] }))
        return
      }
      if (fileModes.includes(mode)) {
        if (!files || files.length !== 100) throw new Error("File writers require seeded canonical files")
        const references = []
        for (let index = 0; index < 25; index++) {
          const slot = Number(label) * 25 + index
          const file = files[mode === "file-replace" ? (slot + 1) % files.length : slot]
          if (mode === "file-append" || mode === "file-replay") {
            const updated = await appendTaskAttachment(taskID, { ...file, intent: "task_input", source: "user-upload" })
            references.push(updated.find((item) => item.sha === file.sha))
          } else {
            const artifact = { ...file, intent: `slot-${slot}`, source: "material" }
            const updated =
              mode === "file-replace"
                ? await replaceTaskSystemArtifactByIntent(taskID, artifact.intent, artifact)
                : await appendTaskSystemArtifact(taskID, artifact)
            references.push(updated.find((item) => item.intent === artifact.intent))
          }
        }
        console.log(JSON.stringify({ references, previews: [] }))
        return
      }
      if (mailboxModes.includes(mode)) {
        if (mode === "mailbox-record") {
          const messages = Array.from({ length: 25 }, (_, index) =>
            recordMailboxMessage({
              taskID,
              sessionID,
              agentID: "solution-architect",
              expertSquadID: "advanced",
              category: "notification",
              subject: `Status ${index}`,
              body: `Body ${index}`,
              attention: true,
              evidenceLocators: [],
              summary: `Status ${index}`,
              correlationID: `concurrent-mailbox-${index}`,
            }),
          )
          console.log(JSON.stringify({ messages }))
        } else {
          const sources = Database.use((db) =>
            db
              .select({ id: ProtocolEventTable.id })
              .from(ProtocolEventTable)
              .where(and(eq(ProtocolEventTable.aggregate_id, taskID), eq(ProtocolEventTable.type, "mailbox.message")))
              .orderBy(asc(ProtocolEventTable.seq))
              .all(),
          )
          let changedCount = 0
          if (mode === "mailbox-readall") changedCount = acknowledgeAllMailboxItemsRead().changedCount
          else if (mode === "mailbox-delete")
            changedCount = deleteMailboxItems({ messageIDs: sources.map((row) => row.id) }).changedCount
          else {
            const action = mode === "mailbox-read" ? "read" : mode === "mailbox-archive" ? "archive" : "restore"
            for (const row of mode === "mailbox-read" ? sources.slice(0, 1) : sources) {
              if (acknowledgeMailboxItem({ messageID: row.id, action }).changed) changedCount++
            }
          }
          console.log(JSON.stringify({ changedCount }))
        }
        return
      }
      const previews: Array<{ id: string; updated: number }> = []
      const titles: string[] = []
      if (mode === "clear") await clearRewindCursor(taskID)
      else
        for (let index = 0; index < 25; index++) {
          if (mode === "rewind") {
            const reason = `${label}:${index}`
            const result = await rewindTask({
              taskID,
              anchor: { kind: "cursorTime", cursorTime: 1000 + index },
              reason,
            })
            receipts.push({ reason, count: result.rewindCount })
          } else if (mode === "state") {
            const updated = await updateTask(
              requireTask(taskID),
              { title: `state-${label}-${index}` },
              "Concurrent title update",
            )
            titles.push(updated.title)
          } else if (mode === "preview") {
            const target = await persistBrowserPreviewTarget({
              taskID,
              url: "http://localhost:49999/Preview",
              now: 1000,
              viewports: [{ id: "desktop", labelKey: "desktop", width: 1280 + index, height: 800 }],
            })
            previews.push({ id: target.id, updated: target.timeUpdated })
          } else if (mode === "promote") {
            const target = await promoteBrowserPreviewTarget({ taskID, targetID: targetID!, now: 1000 })
            if (!target) throw new Error("Persisted target was not found during promotion")
            previews.push({ id: target.id, updated: target.timeUpdated })
          } else updateEngineArtifact({ id: artifacts[Number(label)]!, label: `worker-${label}-${index}` })
        }
      console.log(JSON.stringify({ label, receipts, previews, titles }))
    },
  })
} finally {
  await Instance.disposeAll()
  await Database.awaitEffectIdle(5_000)
  Database.close()
}
