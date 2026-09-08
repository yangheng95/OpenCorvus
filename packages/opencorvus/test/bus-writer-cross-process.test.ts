import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("concurrent durable Bus publications deliver exact values and preserve replay receipts", async () => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Task writer test requires repository runtime")
  const directory = await createManagedTemporaryDirectory(root, "bus-writer-")
  const children: ReturnType<typeof spawn>[] = []
  function spawn(mode: string, label = "") {
    const child = Bun.spawn(
      [
        process.execPath,
        `--config=${path.join(import.meta.dir, "empty-bunfig.toml")}`,
        path.join(import.meta.dir, "fixture/task-outer-writer-process-worker.ts"),
        mode,
        directory,
        label,
      ],
      {
        cwd: path.join(import.meta.dir, ".."),
        env: { ...process.env, OPENCORVUS_HOME: directory },
        stdout: "pipe",
        stderr: "pipe",
      },
    )
    const entry = { child, stdout: new Response(child.stdout).text(), stderr: new Response(child.stderr).text() }
    children.push(entry)
    return entry
  }
  async function read(entry: ReturnType<typeof spawn>) {
    const [exit, stdout, stderr] = await Promise.all([entry.child.exited, entry.stdout, entry.stderr])
    expect(exit, stderr).toBe(0)
    return stdout.trim() ? JSON.parse(stdout) : undefined
  }
  try {
    await read(spawn("init"))
    let original: unknown
    for (const mode of ["bus-publish", "bus-replay"]) {
      const workers = Array.from({ length: 4 }, (_, index) => spawn(mode, String(index)))
      const deadline = Date.now() + 30_000
      while (
        !(
          await Promise.all(
            workers.map((_, index) =>
              fs.stat(path.join(directory, `${mode}-${index}.ready`)).then(
                () => true,
                (error: NodeJS.ErrnoException) => {
                  if (error.code === "ENOENT") return false
                  throw error
                },
              ),
            ),
          )
        ).every(Boolean)
      ) {
        if (Date.now() > deadline) throw new Error("Bus workers did not initialize")
        await Bun.sleep(10)
      }
      await fs.writeFile(path.join(directory, `${mode}.start`), "start")
      const results = await Promise.all(workers.map(read))
      for (const [worker, result] of results.entries()) {
        expect(result.ids.length).toBe(25)
        expect(result.deliveries).toEqual(
          result.ids.map((occurrenceID: string) => ({
            occurrenceID,
            phase: "exact",
            subscriberID: "test.bus-writer",
            outcome: "succeeded",
          })),
        )
        if (mode === "bus-publish")
          expect(result.received).toEqual(Array.from({ length: 25 }, (_, index) => `bus-${worker}-${index}`))
      }
      const ids = results.flatMap((result) => result.ids)
      expect(new Set(ids).size).toBe(100)
      if (mode === "bus-publish") original = ids
      else expect(ids).toEqual(original)
    }
  } finally {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill()
      await child.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 60_000)
