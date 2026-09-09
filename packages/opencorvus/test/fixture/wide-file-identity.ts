import { expect, spyOn } from "bun:test"
import fs from "node:fs/promises"

export async function withWideFileIdentityMismatch(filePath: string, fn: () => Promise<void>) {
  const lexicalInode = 14636698791557095n
  const descriptorInode = 14636698791557096n
  expect(Number(lexicalInode)).toBe(Number(descriptorInode))
  const originalLstat = fs.lstat
  const originalOpen = fs.open
  const restorers: Array<() => void> = []
  const lexical = spyOn(fs, "lstat").mockImplementation((async (...args) => {
    const info = await originalLstat(...args)
    if (args[0] === filePath) {
      Object.defineProperty(info, "ino", {
        value: typeof info.ino === "bigint" ? lexicalInode : Number(lexicalInode),
      })
    }
    return info
  }) as typeof fs.lstat)
  const opened = spyOn(fs, "open").mockImplementation(async (...args) => {
    const handle = await originalOpen(...args)
    if (args[0] === filePath) {
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
    await fn()
  } finally {
    for (const restore of restorers) restore()
    opened.mockRestore()
    lexical.mockRestore()
  }
}
