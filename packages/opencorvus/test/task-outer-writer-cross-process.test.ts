import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("concurrent Task writers return committed rewind counts and preserve artifact updates", async () => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Task writer test requires repository runtime")
  const directory = await createManagedTemporaryDirectory(root, "task-outer-writer-")
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
  const receipts: Array<{ reason: string; count: number }> = []
  try {
    await read(spawn("init"))
    for (const mode of ["rewind", "artifact", "clear"]) {
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
        if (Date.now() > deadline) throw new Error("Task writers did not initialize")
        await Bun.sleep(10)
      }
      await fs.writeFile(path.join(directory, `${mode}.start`), "start")
      const results = await Promise.all(workers.map(read))
      if (mode === "rewind") receipts.push(...results.flatMap((result) => result.receipts))
    }
    const result = await read(spawn("inspect"))
    const rewinds = result.events.filter((event: { type: string }) => event.type === "task.rewound")
    expect(receipts.sort((a, b) => a.count - b.count)).toEqual(
      rewinds
        .slice(0, 100)
        .map((event: { payload: { reason: string } }, index: number) => ({
          reason: event.payload.reason,
          count: index + 1,
        })),
    )
    expect(rewinds.length).toBe(101)
    expect(rewinds[100].payload).toEqual({ cursorTime: 0, reason: "cursor cleared", anchorKind: "cursorTime" })
    expect(result.cursor).toBeNull()
    expect(result.artifacts.map((row: { label: string }) => row.label).sort()).toEqual(
      Array.from({ length: 4 }, (_, index) => `worker-${index}-24`),
    )
    const artifactEvents = result.events.filter((event: { type: string }) => event.type === "artifact.persisted")
    expect(artifactEvents.length).toBe(104)
    expect(
      artifactEvents.map((event: { payload: { catalogRevision: number } }) => event.payload.catalogRevision),
    ).toEqual(Array.from({ length: 104 }, (_, index) => index + 1))
  } finally {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill()
      await child.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 90_000)
