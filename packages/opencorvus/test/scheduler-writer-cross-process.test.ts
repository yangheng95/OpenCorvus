import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("concurrent scheduler senders persist exact notifications and replay their identities from fresh processes", async () => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Scheduler writer test requires repository runtime")
  const directory = await createManagedTemporaryDirectory(root, "scheduler-writer-")
  const children: ReturnType<typeof spawn>[] = []
  function spawn(mode: string, label = "", wave = "") {
    const child = Bun.spawn(
      [
        process.execPath,
        `--config=${path.join(import.meta.dir, "empty-bunfig.toml")}`,
        path.join(import.meta.dir, "fixture/scheduler-writer-process-worker.ts"),
        mode,
        directory,
        label,
        wave,
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
    return JSON.parse(stdout)
  }
  try {
    await fs.mkdir(path.join(directory, "project"), { recursive: true })
    await read(spawn("seed"))
    const waves = []
    for (const wave of ["first", "replay"]) {
      const workers = Array.from({ length: 4 }, (_, index) => spawn("send", String(index), wave))
      const deadline = Date.now() + 30_000
      while (
        !(
          await Promise.all(
            workers.map((_, index) =>
              fs.stat(path.join(directory, `${wave}-${index}.ready`)).then(
                () => true,
                (error) => {
                  if (error.code === "ENOENT") return false
                  throw error
                },
              ),
            ),
          )
        ).every(Boolean)
      ) {
        if (Date.now() > deadline) throw new Error("Scheduler writers did not initialize")
        await Bun.sleep(10)
      }
      await fs.writeFile(path.join(directory, `${wave}.start`), "start")
      waves.push((await Promise.all(workers.map(read))).flat())
    }
    const expected = Array.from({ length: 4 }, (_, worker) =>
      Array.from({ length: 50 }, (_, index) => `scheduler-${worker}-${index}`),
    ).flat()
    expect(waves[0].map((row) => row.invocation)).toEqual(expected)
    expect(waves[1]).toEqual(waves[0])
    const result = await read(spawn("inspect"))
    const byID = (rows: Array<{ id: string }>) => rows.sort((a, b) => a.id.localeCompare(b.id))
    expect(byID(result.events)).toEqual(
      byID(
        waves[0].map((row) => ({
          id: row.eventID,
          invocation: row.invocation,
          subject: row.invocation,
        })),
      ),
    )
    expect(byID(result.inbox)).toEqual(byID(waves[0].map((row) => ({ id: row.inboxID, eventID: row.eventID }))))
  } finally {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill()
      await child.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 90_000)
