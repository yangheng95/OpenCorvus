import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("concurrent Task writers return committed rewind counts and preserve artifact and file references", async () => {
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
  const previews: Array<{ id: string; updated: number }> = []
  try {
    await read(spawn("init"))
    const files = await read(spawn("file-seed"))
    await read(spawn("completion-seed"))
    for (const mode of [
      "rewind",
      "artifact",
      "clear",
      "preview",
      "promote",
      "state",
      "file-append",
      "file-replay",
      "file-artifact",
      "file-replace",
      "completion",
      "shutdown",
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
        if (Date.now() > deadline) throw new Error("Task writers did not initialize")
        await Bun.sleep(10)
      }
      await fs.writeFile(path.join(directory, `${mode}.start`), "start")
      const results = await Promise.all(workers.map(read))
      if (mode === "shutdown") {
        for (const [worker, result] of results.entries()) {
          expect(result.handoffs.map((handoff: { reason: string }) => handoff.reason)).toEqual(
            Array.from({ length: 25 }, (_, index) => `shutdown-${worker}-${index}`),
          )
          expect(result.persisted).toEqual(
            result.handoffs.map(
              (handoff: { taskID: string; recoveryFactID: string; wakeID: string; reason: string }) => ({
                ...handoff,
                wakeTaskID: handoff.taskID,
                source: "engine_artifact",
                sourceID: handoff.recoveryFactID,
                epoch: 1,
              }),
            ),
          )
        }
        expect(
          new Set(
            results.flatMap((result) =>
              result.handoffs.map((handoff: { recoveryFactID: string }) => handoff.recoveryFactID),
            ),
          ).size,
        ).toBe(100)
        expect(
          new Set(results.flatMap((result) => result.handoffs.map((handoff: { wakeID: string }) => handoff.wakeID)))
            .size,
        ).toBe(100)
      }
      if (mode === "completion") {
        expect(results.map((result) => result.closures)).toEqual(
          Array.from({ length: 4 }, (_, worker) =>
            Array.from({ length: 25 }, () => ({ ownerID: `completion-${worker}`, released: true })),
          ),
        )
      }
      if (mode.startsWith("file-")) {
        expect(results.flatMap((result) => result.references)).toEqual(
          files.map((file: object, slot: number) =>
            mode === "file-append" || mode === "file-replay"
              ? { ...file, intent: "task_input", source: "user-upload" }
              : {
                  ...(mode === "file-replace" ? files[(slot + 1) % files.length] : file),
                  intent: `slot-${slot}`,
                  source: "material",
                },
          ),
        )
      }
      if (mode === "rewind") receipts.push(...results.flatMap((result) => result.receipts))
      previews.push(...results.flatMap((result) => result.previews))
      if (mode === "state") {
        expect(results.map((result) => result.titles)).toEqual(
          Array.from({ length: 4 }, (_, worker) =>
            Array.from({ length: 25 }, (_, index) => `state-${worker}-${index}`),
          ),
        )
      }
    }
    const result = await read(spawn("inspect"))
    const bySha = (rows: Array<{ sha: string }>) => rows.sort((a, b) => a.sha.localeCompare(b.sha))
    expect(bySha(result.attachments)).toEqual(
      bySha(files.map((file: object) => ({ ...file, intent: "task_input", source: "user-upload" }))),
    )
    expect(bySha(result.systemArtifacts)).toEqual(
      bySha(
        files.map((_: object, slot: number) => ({
          ...files[(slot + 1) % files.length],
          intent: `slot-${slot}`,
          source: "material",
        })),
      ),
    )
    expect(Array.from({ length: 4 }, (_, worker) => `state-${worker}-24`)).toContain(result.title)
    const rewinds = result.events.filter((event: { type: string }) => event.type === "task.rewound")
    expect(receipts.sort((a, b) => a.count - b.count)).toEqual(
      rewinds.slice(0, 100).map((event: { payload: { reason: string } }, index: number) => ({
        reason: event.payload.reason,
        count: index + 1,
      })),
    )
    expect(rewinds.length).toBe(101)
    expect(rewinds[100].payload).toEqual({ cursorTime: 0, reason: "cursor cleared", anchorKind: "cursorTime" })
    expect(result.cursor).toBeNull()
    expect(result.artifacts.map((row: { label: string }) => row.label).sort()).toEqual([
      "BrowserPreviewTarget",
      ...Array.from({ length: 4 }, (_, index) => `worker-${index}-24`),
    ])
    expect(result.targets.length).toBe(1)
    expect(result.targets[0].canonical_url).toBe("http://localhost:49999/Preview")
    expect(result.artifacts.find((row: { id: string }) => row.id === result.targets[0].artifact_id)).toEqual({
      id: result.targets[0].artifact_id,
      label: "BrowserPreviewTarget",
      revision: 304,
      updated: 1199,
      payload: {
        url: "http://localhost:49999/Preview",
        source: "engine-artifact",
        viewports: [{ id: "desktop", labelKey: "desktop", width: 1304, height: 800 }],
      },
    })
    expect(previews.sort((a, b) => a.updated - b.updated)).toEqual(
      Array.from({ length: 200 }, (_, index) => ({
        id: result.targets[0].artifact_id,
        updated: 1000 + index,
      })),
    )
    const artifactEvents = result.events.filter((event: { type: string }) => event.type === "artifact.persisted")
    expect(artifactEvents.length).toBe(304)
    expect(
      artifactEvents.map((event: { payload: { catalogRevision: number } }) => event.payload.catalogRevision),
    ).toEqual(Array.from({ length: 304 }, (_, index) => index + 1))
  } finally {
    for (const { child } of children) {
      if (child.exitCode === null) child.kill()
      await child.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 90_000)
