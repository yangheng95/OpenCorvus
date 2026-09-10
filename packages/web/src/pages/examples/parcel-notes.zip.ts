import { readFile } from "node:fs/promises"
import path from "node:path"
import { Uint8ArrayReader, Uint8ArrayWriter, ZipWriter } from "@zip.js/zip.js"

export const prerender = true

// Website commands run from packages/web. The source sample owns these bytes.
export async function GET() {
  const source = path.resolve(process.cwd(), "../../examples/parcel-notes")
  const archive = new ZipWriter(new Uint8ArrayWriter(), { useWebWorkers: false, level: 0 })
  for (const name of ["package.json", "src/index.js", "test/output.test.js"]) {
    await archive.add(`parcel-notes/${name}`, new Uint8ArrayReader(await readFile(path.join(source, name))), {
      lastModDate: new Date("2026-09-01T00:00:00Z"),
    })
  }
  return new Response(await archive.close(), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="parcel-notes.zip"',
    },
  })
}
