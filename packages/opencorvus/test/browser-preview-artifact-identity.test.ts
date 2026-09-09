import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"
import { readBrowserPreviewArtifactFile } from "../src/browser-preview/artifact-file"

import { withWideFileIdentityMismatch } from "./fixture/wide-file-identity"

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
    await withWideFileIdentityMismatch(input.filePath, async () => {
      await expect(readBrowserPreviewArtifactFile(input)).rejects.toThrow(
        `Browser Preview artifact identity changed before it was opened: ${input.filePath}`,
      )
    })
  })
})
