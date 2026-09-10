import { expect, test } from "bun:test"
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { Uint8ArrayReader, Uint8ArrayWriter, ZipReader } from "@zip.js/zip.js"
import { GET } from "../src/pages/examples/parcel-notes.zip"

test("sample download contains canonical files and runs as an extracted project", async () => {
  const response = await GET()
  expect(response.status).toBe(200)
  expect(response.headers.get("Content-Type")).toBe("application/zip")
  const archive = new ZipReader(new Uint8ArrayReader(new Uint8Array(await response.arrayBuffer())))
  const temp = await mkdtemp(path.join(tmpdir(), "opencorvus-sample-download-"))
  try {
    const entries = await archive.getEntries()
    expect(entries.map((entry) => entry.filename)).toEqual([
      "parcel-notes/package.json",
      "parcel-notes/src/index.js",
      "parcel-notes/test/output.test.js",
    ])
    for (const entry of entries) {
      if (entry.directory || !entry.getData) throw new Error(`Expected file: ${entry.filename}`)
      const bytes = await entry.getData(new Uint8ArrayWriter())
      expect(Buffer.from(bytes)).toEqual(await readFile(path.resolve("../../examples", entry.filename)))
      const target = path.join(temp, entry.filename)
      await mkdir(path.dirname(target), { recursive: true })
      await writeFile(target, bytes)
    }
    const cwd = path.join(temp, "parcel-notes")
    const program = spawnSync("node", ["src/index.js"], { cwd, encoding: "utf8", timeout: 10_000 })
    expect(program.status).toBe(0)
    expect(program.stdout.trim()).toBe("750 g")
    const check = spawnSync("node", ["--test", "--test-reporter=tap", "test/output.test.js"], {
      cwd,
      encoding: "utf8",
      timeout: 10_000,
    })
    expect(check.status).toBe(0)
    expect(check.stdout).toContain("# pass 1")
  } finally {
    await archive.close()
    await rm(temp, { recursive: true, force: true })
  }
})
