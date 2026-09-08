import fs from "node:fs"
import path from "node:path"
import { Database, asc, eq } from "@/storage/db"
import { ProtocolStore } from "@/protocol/store"
import { ProtocolEventTable } from "@/protocol/protocol.sql"

const [mode, directory, label] = process.argv.slice(2)
if (!mode || !directory) throw new Error("Protocol append worker requires mode and barrier directory")
const aggregateID = "stream:cross-process-sequence"
try {
  Database.Client()
  if (mode === "inspect") {
    console.log(JSON.stringify(Database.use((db) => db
      .select({ sequence: ProtocolEventTable.seq, source: ProtocolEventTable.source, payload: ProtocolEventTable.payload })
      .from(ProtocolEventTable).where(eq(ProtocolEventTable.aggregate_id, aggregateID))
      .orderBy(asc(ProtocolEventTable.seq)).all())))
  } else if (mode !== "init") {
    if (!label || (mode !== "direct" && mode !== "transaction")) throw new Error("Invalid append worker mode")
    fs.writeFileSync(path.join(directory, `${label}.ready`), "ready")
    const deadline = Date.now() + 30_000
    while (!fs.existsSync(path.join(directory, `${mode}.start`))) {
      if (Date.now() > deadline) throw new Error("Append worker start barrier timed out")
      await Bun.sleep(10)
    }
    for (let index = 0; index < 100; index++) {
      const input = {
        kind: "event" as const, type: "sequence.concurrent", aggregate: "stream" as const,
        aggregate_id: aggregateID, stream_id: aggregateID, source: label, payload: { index },
      }
      if (mode === "direct") await ProtocolStore.appendEvent(input)
      else Database.immediateTransaction(() => ProtocolStore.appendEventInTransaction(input))
    }
    console.log(JSON.stringify({ label, committed: 100 }))
  }
} finally {
  await Database.awaitEffectIdle(5_000)
  Database.close()
}
