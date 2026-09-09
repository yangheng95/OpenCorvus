import { expect, test } from "bun:test"
import path from "node:path"
import { createManagedTemporaryDirectory, removeManagedDirectoryTree } from "@opencorvus-ai/util/runtime-directories"
import { runHostCommandWithInactivity } from "../src/shell/command-inactivity"

test.each([1, 7])(
  "test runner identifies the selected file and preserves exit %d",
  async (exitCode) => {
    const root = process.env.OPENCORVUS_TEST_PROCESS_ROOT
    if (!root) throw new Error("Runner diagnostic test requires repository runtime")
    const directory = await createManagedTemporaryDirectory(root, "runner-diagnostic-")
    const file = path.join(directory, "selected failure.ts")
    try {
      await Bun.write(
        file,
        `import { test } from "bun:test";
test("diagnostic fixture", () => {
  console.log("RUNNER_FIXTURE_STDOUT");
  console.error("RUNNER_FIXTURE_STDERR");
  ${exitCode === 1 ? 'throw new Error("deliberate runner fixture failure")' : "process.exit(7)"};
});`,
      )
      const result = await runHostCommandWithInactivity({
        executable: process.execPath,
        args: ["script/run-tests.ts", file],
        cwd: path.resolve(import.meta.dir, ".."),
        env: { ...process.env },
        inactivityTimeoutMs: 30_000,
      })
      expect(result.exitCode).toBe(exitCode)
      expect(result.stdout).toContain("RUNNER_FIXTURE_STDOUT")
      expect(result.stderr).toContain("RUNNER_FIXTURE_STDERR")
      expect(result.stderr).toContain(`OpenCorvus test file failed (exit=${exitCode}): ${file}`)
    } finally {
      await removeManagedDirectoryTree(directory)
    }
  },
  60_000,
)
