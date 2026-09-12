import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"

const SCRIPT_DIRECTORY = import.meta.dir
const REPOSITORY_DIRECTORY = path.resolve(SCRIPT_DIRECTORY, "../../../../..")

export async function readBenchmarkSourceEvidence() {
  if (process.env.OPENCORVUS_AGENT_TRACE_EVENT_MAX_BYTES !== undefined) {
    throw new Error("Formal benchmark runs require the frozen default AgentTrace event byte bound")
  }
  const git = (args: string[]) => {
    const result = Bun.spawnSync(["git", ...args], { cwd: REPOSITORY_DIRECTORY })
    if (result.exitCode !== 0) throw new Error(`Benchmark source identity failed: git ${args.join(" ")}`)
    return result.stdout.toString().trim()
  }
  const commit = git(["rev-parse", "HEAD"])
  const status = git(["status", "--short"])
  const bundleFiles = [
    "automationbench-api.SKILL.md",
    "automationbench_bridge.py",
    "automationbench_tool.py",
    "automationbench-case-set.json",
    "freeze_automationbench_case_set.py",
    "restricted-agent-shell-base.sh",
    "restricted-agent-shell.sh",
    "verify_automationbench_replay.py",
    "contract.ts",
    "trace-evidence.ts",
    "run-automationbench.ts",
    "run-automationbench-batch.ts",
    "source-evidence.ts",
    "runtime-evidence.ts",
  ]
  const bundle = crypto.createHash("sha256")
  for (const name of bundleFiles) {
    bundle.update(name)
    bundle.update("\0")
    bundle.update(await fs.readFile(path.join(SCRIPT_DIRECTORY, name)))
    bundle.update("\0")
  }
  return {
    commit,
    worktree_clean: status.length === 0,
    dirty_paths: status ? status.split(/\r?\n/) : [],
    benchmark_bundle_sha256: bundle.digest("hex"),
  }
}
