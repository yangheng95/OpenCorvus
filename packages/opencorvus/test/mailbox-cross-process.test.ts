import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("mailbox replays and acknowledgements converge across independent processes", async () => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Mailbox process test requires repository runtime")
  const directory = await createManagedTemporaryDirectory(root, "mailbox-writers-")
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
  let expectedMessages: Array<{ id: string; body: string }> = []
  try {
    await read(spawn("init"))
    for (const mode of [
      "mailbox-record",
      "mailbox-read",
      "mailbox-readall",
      "mailbox-archive",
      "mailbox-restore",
      "mailbox-delete",
    ]) {
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
        if (Date.now() > deadline) throw new Error("Mailbox workers did not initialize")
        await Bun.sleep(10)
      }
      await fs.writeFile(path.join(directory, `${mode}.start`), "start")
      const results = await Promise.all(workers.map(read))
      if (mode === "mailbox-record") {
        expectedMessages = results[0].messages.map((message: { id: string; payload: { body: string } }) => ({
          id: message.id,
          body: message.payload.body,
        }))
        expect(expectedMessages.length).toBe(25)
        for (let index = 0; index < 25; index++) {
          const messages = results.map((result) => result.messages[index])
          expect(messages.filter((message) => message.createdNow).length).toBe(1)
          expect(messages.map((message) => ({ id: message.id, body: message.payload.body }))).toEqual(
            Array.from({ length: 4 }, () => ({ id: expectedMessages[index]!.id, body: `Body ${index}` })),
          )
        }
      } else {
        const expected = mode === "mailbox-read" ? 1 : mode === "mailbox-readall" ? 24 : 25
        expect(results.reduce((sum, result) => sum + result.changedCount, 0)).toBe(expected)
      }
    }
    const { events } = await read(spawn("inspect"))
    const sources = events.filter((event: { type: string }) => event.type === "mailbox.message")
    expect(
      sources
        .map((event: { id: string; payload: { body: string } }) => ({ id: event.id, body: event.payload.body }))
        .sort((a: { body: string }, b: { body: string }) => a.body.localeCompare(b.body)),
    ).toEqual(expectedMessages.sort((a, b) => a.body.localeCompare(b.body)))
    const acknowledgements = events.filter((event: { type: string }) => event.type === "mailbox.acknowledged")
    expect(
      acknowledgements
        .map(
          (event: { payload: { messageID: string; action: string } }) =>
            `${event.payload.messageID}:${event.payload.action}`,
        )
        .sort(),
    ).toEqual(
      expectedMessages
        .flatMap(({ id }) => ["read", "archive", "restore", "delete"].map((action) => `${id}:${action}`))
        .sort(),
    )
  } finally {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill()
      await child.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 120_000)
