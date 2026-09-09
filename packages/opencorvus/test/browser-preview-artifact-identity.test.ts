import { expect, spyOn, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"
import { readBrowserPreviewArtifactFile } from "../src/browser-preview/artifact-file"

async function withArtifact(
  fn: (input: { filePath: string; authorityRoot: string; scopedRoot: string }) => Promise<void>,
) {
  const processRoot = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!processRoot) throw new Error("Artifact tests require the repository test preload")
  const root = await createManagedTemporaryDirectory(processRoot, "artifact-identity-")
  try {
    const filePath = path.join(root, "artifact.txt")
    await fs.writeFile(filePath, "exact artifact bytes")
    await fn({ filePath, authorityRoot: root, scopedRoot: root })
  } finally {
    await removeManagedDirectoryTree(root)
  }
}

test("reads exact artifact bytes through real path and descriptor observations", async () => {
  await withArtifact(async (input) => {
    expect(await readBrowserPreviewArtifactFile(input)).toEqual(Buffer.from("exact artifact bytes"))
  })
})

test("returns the identity-change error for distinct wide path and descriptor inodes", async () => {
  await withArtifact(async (input) => {
    const lexicalInode = 14636698791557095n
    const descriptorInode = 14636698791557096n
    expect(Number(lexicalInode)).toBe(Number(descriptorInode))
    const originalLstat = fs.lstat
    const originalOpen = fs.open
    const restorers: Array<() => void> = []
    const lexical = spyOn(fs, "lstat").mockImplementation((async (...args) => {
      const info = await originalLstat(...args)
      if (args[0] === input.filePath) {
        Object.defineProperty(info, "ino", {
          value: typeof info.ino === "bigint" ? lexicalInode : Number(lexicalInode),
        })
      }
      return info
    }) as typeof fs.lstat)
    const opened = spyOn(fs, "open").mockImplementation(async (...args) => {
      const handle = await originalOpen(...args)
      if (args[0] === input.filePath) {
        const originalStat = handle.stat.bind(handle)
        const observation = spyOn(handle, "stat").mockImplementation((async (...options) => {
          const info = await originalStat(...options)
          Object.defineProperty(info, "ino", {
            value: typeof info.ino === "bigint" ? descriptorInode : Number(descriptorInode),
          })
          return info
        }) as typeof handle.stat)
        restorers.push(() => observation.mockRestore())
      }
      return handle
    })
    try {
      await expect(readBrowserPreviewArtifactFile(input)).rejects.toThrow(
        `Browser Preview artifact identity changed before it was opened: ${input.filePath}`,
      )
    } finally {
      for (const restore of restorers) restore()
      opened.mockRestore()
      lexical.mockRestore()
    }
  })
})
