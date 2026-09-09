import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

type WriterReadiness = {
  label: string
  child: { exitCode: number | null }
  stdout: Promise<string>
  stderr: Promise<string>
}

async function waitForTaskWriters(directory: string, mode: string, workers: WriterReadiness[]) {
  const deadline = Date.now() + 30_000
  for (;;) {
    for (const worker of workers) {
      if (worker.child.exitCode === null) continue
      const [stdout, stderr] = await Promise.all([worker.stdout, worker.stderr])
      throw new Error(
        `Task ${mode} writer ${worker.label} exited before start (exit=${worker.child.exitCode}); STDERR=${stderr.slice(-1200)}; STDOUT=${stdout.slice(-1200)}`,
      )
    }
    const ready = await Promise.all(
      workers.map((worker) =>
        fs.stat(path.join(directory, `${mode}-${worker.label}.ready`)).then(
          () => true,
          (error: NodeJS.ErrnoException) => {
            if (error.code === "ENOENT") return false
            throw error
          },
        ),
      ),
    )
    if (ready.every(Boolean)) return
    if (Date.now() > deadline) {
      const pending = workers.filter((_, index) => !ready[index]).map((worker) => worker.label)
      throw new Error(`Task ${mode} writers did not initialize within 30000ms; pending=${pending.join(",")}`)
    }
    await Bun.sleep(10)
  }
}

test.each([0, 7])("reports exact Task writer identity and output after early exit %d", async (exitCode) => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Task writer test requires repository runtime")
  const directory = await createManagedTemporaryDirectory(root, "task-writer-diagnostic-")
  const child = Bun.spawn(
    [
      process.execPath,
      "-e",
      `process.stdout.write("startup".repeat(400) + "FINAL_OUT"); process.stderr.write("FINAL_ERR"); process.exit(${exitCode})`,
    ],
    { stdout: "pipe", stderr: "pipe" },
  )
  const worker = {
    label: "diagnostic-worker",
    child,
    stdout: new Response(child.stdout).text(),
    stderr: new Response(child.stderr).text(),
  }
  try {
    await expect(waitForTaskWriters(directory, "diagnostic", [worker])).rejects.toThrow(
      `Task diagnostic writer diagnostic-worker exited before start (exit=${exitCode}); STDERR=FINAL_ERR; STDOUT=p${"startup".repeat(170)}FINAL_OUT`,
    )
  } finally {
    if (child.exitCode === null) child.kill()
    await Promise.all([child.exited, worker.stdout, worker.stderr])
    await removeManagedDirectoryTree(directory)
  }
})

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
    const entry = { label, child, stdout: new Response(child.stdout).text(), stderr: new Response(child.stderr).text() }
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
    expect(await read(spawn("file-retain"))).toEqual({
      kept: 100,
      contents: Array.from({ length: 100 }, (_, index) => `Task file ${index}`),
    })
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
      "ingress",
    ]) {
      const workers = Array.from({ length: 4 }, (_, index) => spawn(mode, String(index)))
      await waitForTaskWriters(directory, mode, workers)
      await fs.writeFile(path.join(directory, `${mode}.start`), "start")
      const results = await Promise.all(workers.map(read))
      if (mode === "ingress") {
        for (const [worker, result] of results.entries()) {
          expect(result.accepted).toEqual(
            Array.from({ length: 50 }, () => ({ taskID: result.taskID, result: "accepted" })),
          )
          expect(
            result.persisted.sort((a: { payload: { note: string } }, b: { payload: { note: string } }) =>
              a.payload.note.localeCompare(b.payload.note),
            ),
          ).toEqual(
            Array.from({ length: 25 }, (_, index) => ({
              taskID: result.taskID,
              epoch: 1,
              payload: { note: `ingress-${worker}-${index}` },
            })).sort((a, b) => a.payload.note.localeCompare(b.payload.note)),
          )
        }
      }
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
  // Preparation, thirteen four-worker phases and inspection start 57 fresh processes.
}, 180_000)
