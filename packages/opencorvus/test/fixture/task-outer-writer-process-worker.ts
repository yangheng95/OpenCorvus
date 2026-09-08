import fs from "node:fs"
import path from "node:path"
import { Database, asc, eq } from "@/storage/db"
import { Instance } from "@/project/instance"
import { Session } from "@/session"
import { Identifier } from "@/id/id"
import { EngineTaskTable, EngineArtifactTable, EngineBrowserPreviewTargetIdentityTable } from "@/engine/engine.sql"
import { persistBrowserPreviewTarget, promoteBrowserPreviewTarget } from "@/browser-preview/persist"
import { appendTaskOpenedInTransaction } from "@/engine/task-lifecycle"
import { recordEngineArtifact, updateEngineArtifact } from "@/engine/artifact"
import { rewindTask, clearRewindCursor, taskRewindCursor } from "@/engine/rewind"
import { ProtocolEventTable } from "@/protocol/protocol.sql"

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
        fs.writeFileSync(inputPath, JSON.stringify({ taskID, artifacts }))
        return
      }
      const { taskID, artifacts } = JSON.parse(fs.readFileSync(inputPath, "utf8")) as {
        taskID: string
        artifacts: string[]
      }
      if (mode === "inspect") {
        const events = Database.use((db) =>
          db
            .select({ type: ProtocolEventTable.type, payload: ProtocolEventTable.payload })
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
        console.log(JSON.stringify({ events, artifacts: rows, targets, cursor: taskRewindCursor(taskID) }))
        return
      }
      if (!label || !["rewind", "artifact", "clear", "preview", "promote"].includes(mode))
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
      const previews: Array<{ id: string; updated: number }> = []
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
      console.log(JSON.stringify({ label, receipts, previews }))
    },
  })
} finally {
  await Instance.disposeAll()
  await Database.awaitEffectIdle(5_000)
  Database.close()
}
