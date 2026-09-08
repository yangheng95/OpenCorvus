import { expect, test } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"

test("recovers a committed Question reply and one authored memory after its process exits", async () => {
  const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
  if (!root) throw new Error("Question recovery test requires repository runtime")
  const directory = await createManagedTemporaryDirectory(root, "question-process-recovery-")
  const children: ReturnType<typeof Bun.spawn>[] = []
  async function run(mode: string, expectedExit = 0) {
    const fixture = mode === "init" ? "task-outer-writer-process-worker.ts" : "question-process-recovery-worker.ts"
    const child = Bun.spawn(
      [
        process.execPath,
        `--config=${path.join(import.meta.dir, "empty-bunfig.toml")}`,
        path.join(import.meta.dir, "fixture", fixture),
        mode,
        directory,
      ],
      {
        cwd: path.join(import.meta.dir, ".."),
        env: { ...process.env, OPENCORVUS_HOME: directory },
        stdout: "pipe",
        stderr: "pipe",
      },
    )
    children.push(child)
    const [exit, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ])
    expect(exit, `${mode} exited ${exit}\n${stderr.slice(-2500)}\n${stdout.slice(-1000)}\n${stderr}`).toBe(expectedExit)
    return stdout.trim() ? JSON.parse(stdout) : undefined
  }
  try {
    await run("init")
    await run("crash", 23)
    const saved = JSON.parse(await fs.readFile(path.join(directory, "question-checkpoint.json"), "utf8"))
    expect({ httpStatus: saved.httpStatus, status: saved.status, answers: saved.answers }).toEqual({
      httpStatus: 500,
      status: "pending",
      answers: [["persisted before process exit"]],
    })
    const recovered = await run("recover")
    expect(recovered).toMatchObject({
      interactionID: saved.interactionID,
      taskID: saved.taskID,
      sessionID: saved.sessionID,
      status: "answered",
      response: { answers: saved.answers },
    })
    expect(recovered.outcomes).toHaveLength(1)
    expect(recovered.outcomes[0]).toMatchObject({
      interaction_id: saved.interactionID,
      source_occurrence_id: saved.occurrenceID,
    })
    expect(recovered.memories).toHaveLength(1)
    expect(recovered.memories[0]).toMatchObject({
      occurrenceKind: "interaction_reply",
      occurrenceID: saved.interactionID,
      projectID: saved.projectID,
      taskID: saved.taskID,
      sessionID: saved.sessionID,
      surface: "http.question",
      text: JSON.stringify(saved.answers),
      structured: { answers: saved.answers },
    })
    expect(await run("verify")).toEqual(recovered)
  } finally {
    for (const child of children) {
      if (child.exitCode === null) child.kill()
      await child.exited
    }
    await removeManagedDirectoryTree(directory)
  }
}, 60_000)
