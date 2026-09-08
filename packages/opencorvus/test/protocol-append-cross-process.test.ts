import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("independent protocol writers preserve every payload and sequence across process restarts", async () => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Protocol process test requires the repository test runtime")
  const directory = await createManagedTemporaryDirectory(root, "protocol-append-")
  const children: ReturnType<typeof spawn>[] = []
  function spawn(mode: string, label = "") {
    const process = Bun.spawn([
      globalThis.process.execPath,
      `--config=${path.join(import.meta.dir, "empty-bunfig.toml")}`,
      path.join(import.meta.dir, "fixture/protocol-append-process-worker.ts"), mode, directory, label,
    ], {
      cwd: path.join(import.meta.dir, ".."), env: { ...globalThis.process.env, OPENCORVUS_HOME: directory },
      stdout: "pipe", stderr: "pipe",
    })
    const child = { process, stdout: new Response(process.stdout).text(), stderr: new Response(process.stderr).text() }
    children.push(child)
    return child
  }
  async function read(child: ReturnType<typeof spawn>) {
    const [exit, stdout, stderr] = await Promise.all([child.process.exited, child.stdout, child.stderr])
    expect(exit, stderr).toBe(0)
    return stdout.trim() ? JSON.parse(stdout) : undefined
  }
  try {
    await read(spawn("init"))
    for (const mode of ["direct", "transaction"]) {
      const labels = Array.from({ length: 4 }, (_, index) => `${mode}-${index}`)
      const writers = labels.map((label) => spawn(mode, label))
      const deadline = Date.now() + 30_000
      while (!(await Promise.all(labels.map((label) => fs.stat(path.join(directory, `${label}.ready`))
        .then(() => true, (error: NodeJS.ErrnoException) => {
          if (error.code === "ENOENT") return false
          throw error
        })))).every(Boolean)) {
        if (Date.now() > deadline) throw new Error("Protocol writers did not initialize")
        await Bun.sleep(10)
      }
      await fs.writeFile(path.join(directory, `${mode}.start`), "start")
      expect(await Promise.all(writers.map(read))).toEqual(labels.map((label) => ({ label, committed: 100 })))
    }
    const rows = await read(spawn("inspect")) as Array<{ sequence: number; source: string; payload: { index: number } }>
    expect(rows.map((row) => row.sequence)).toEqual(Array.from({ length: 800 }, (_, index) => index + 1))
    expect(rows.map((row) => `${row.source}:${row.payload.index}`).sort()).toEqual(
      ["direct", "transaction"].flatMap((mode) => Array.from({ length: 4 }, (_, writer) =>
        Array.from({ length: 100 }, (_, index) => `${mode}-${writer}:${index}`))).flat().sort(),
    )
  } finally {
    for (const child of children) {
      if (child.process.exitCode === null) child.process.kill()
      await child.process.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 90_000)
