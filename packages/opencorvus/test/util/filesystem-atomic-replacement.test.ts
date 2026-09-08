import { describe, expect, test } from "bun:test"
import { mkdtemp, open, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { Filesystem } from "../../src/util/filesystem"
import { renameReplace, renameReplaceWriteThrough } from "../../src/util/rename-no-replace"

describe("atomic file replacement", () => {
  for (const [name, write] of [
    ["ordinary", Filesystem.writeAtomic],
    ["durable", Filesystem.writeDurableAtomic],
  ] as const) {
    test(`${name} publishes complete generations while existing readers retain their bytes`, async () => {
      const root = await mkdtemp(path.join(tmpdir(), "opencorvus-atomic-"))
      try {
        const target = path.join(root, "nested", "授权 🐦.json")
        const original = JSON.stringify({ generation: 0, payload: "original".repeat(1024) })
        await write(target, original, 0o600)
        expect(await readFile(target, "utf8")).toBe(original)
        const reader = await open(target, "r")
        try {
          for (let generation = 1; generation <= 10; generation++) {
            const next = JSON.stringify({ generation, payload: `value-${generation}`.repeat(1024) })
            await write(target, next, 0o600)
            expect(await readFile(target, "utf8")).toBe(next)
          }
          expect(await reader.readFile("utf8")).toBe(original)
        } finally {
          await reader.close()
        }
      } finally {
        await rm(root, { recursive: true, force: true })
      }
    })
  }

  test("missing source reports the filesystem ENOENT contract", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "opencorvus-atomic-error-"))
    try {
      for (const replace of [renameReplace, renameReplaceWriteThrough]) {
        await expect(replace(path.join(root, "missing"), path.join(root, "target"))).rejects.toMatchObject({
          code: "ENOENT",
        })
      }
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
