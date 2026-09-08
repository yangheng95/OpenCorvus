import fs from "node:fs"
import path from "node:path"
import { Instance } from "@/project/instance"
import { Database, eq } from "@/storage/db"
import { Question } from "@/question"
import { QuestionRoutes } from "@/server/routes/question"
import { EngineInteraction } from "@/engine/interaction"
import { findInteractionByExternal } from "@/engine/store"
import { Bus } from "@/bus"
import { Identifier } from "@/id/id"
import { ProjectMemory } from "@/memory/project-memory"
import { EngineInteractionOutcomeTable } from "@/engine/engine.sql"

const [mode, directory] = process.argv.slice(2)
if (!directory || !["crash", "recover", "verify"].includes(mode!))
  throw new Error("Question recovery worker requires phase and directory")
const checkpoint = path.join(directory, "question-checkpoint.json")
async function until(check: () => boolean) {
  const deadline = Date.now() + 30_000
  while (!check()) {
    if (Date.now() > deadline) throw new Error(`Question ${mode} checkpoint deadline`)
    await Bun.sleep(20)
  }
}
try {
  await Instance.provide({
    directory: path.join(directory, "project"),
    fn: async () => {
      EngineInteraction.subscribe()
      if (mode === "crash") {
        const { taskID, sessionID } = JSON.parse(fs.readFileSync(path.join(directory, "input.json"), "utf8"))
        const requestID = Identifier.ascending("question")
        void Question.ask({
          requestID,
          sessionID,
          questions: [{ header: "Recovery", question: "Which result?", options: [] }],
          expireOnDeadline: false,
        }).catch(() => undefined)
        await until(
          () => findInteractionByExternal(requestID)?.status === "pending" && Bus.TestHooks.outbox().length === 0,
        )
        using interruption = Question.TestHooks.failAfterNextUserOutboxCommit()
        using suppression = Bus.TestHooks.suppressAutomaticDurableDrain()
        const answers = [["persisted before process exit"]]
        const response = await QuestionRoutes().request(`/${requestID}/reply`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ answers }),
        })
        const row = findInteractionByExternal(requestID)!
        const pending = Bus.TestHooks.outbox().filter((item) => item.event_type === Question.Event.Replied.type)
        if (response.status !== 500 || row.status !== "pending" || pending.length !== 1)
          throw new Error("Post-commit checkpoint mismatch")
        fs.writeFileSync(
          checkpoint,
          JSON.stringify({
            taskID,
            sessionID,
            projectID: Instance.project.id,
            requestID,
            interactionID: row.id,
            occurrenceID: pending[0]!.occurrence_id,
            answers,
            httpStatus: response.status,
            status: row.status,
          }),
        )
        // Deliberately terminate this test-owned process before Instance/Bus cleanup.
        process.exit(23)
      }
      const saved = JSON.parse(fs.readFileSync(checkpoint, "utf8"))
      Bus.resumeDurablePublications()
      await until(
        () => findInteractionByExternal(saved.requestID)?.status === "answered" && Bus.TestHooks.outbox().length === 0,
      )
      const row = findInteractionByExternal(saved.requestID)!
      const outcomes = Database.use((db) =>
        db
          .select()
          .from(EngineInteractionOutcomeTable)
          .where(eq(EngineInteractionOutcomeTable.interaction_id, saved.interactionID))
          .all(),
      )
      const memories = ProjectMemory.pending(Instance.project.id).filter(
        (entry) => entry.occurrenceID === saved.interactionID,
      )
      console.log(
        JSON.stringify({
          interactionID: row.id,
          taskID: row.task_id,
          sessionID: row.session_id,
          status: row.status,
          response: row.response,
          outcomes,
          memories,
        }),
      )
    },
  })
} finally {
  await Instance.disposeAll()
  await Database.awaitEffectIdle(5000)
  Database.close()
}
