# Luna versus Luna + Base reproduction

Protocol and current execution status: [dated record](../../../../records/2026-09/2026-09-12-luna-base-reproduction.md).

## Local results page

Open [the current comparison](http://localhost:8765/ui) on the experiment machine. It updates every 30 seconds from the native results and Base's existing catalog/leases. It shows scored denominators, running/awaiting states, per-case results, and comparisons only for completed pairs. The localhost viewer exposes only selected summary fields and does not serve raw files, prompts, logs or credentials.

The independent viewer uses the real WSL evidence root; no product UI or benchmark process is restarted:

```bash
/var/lib/opencorvus-benchmark/evaluator-venv/bin/python -B \
  /mnt/d/myhexin-local/opencorvus/script/benchmark/reproduction_dashboard.py \
  --native-root /var/lib/opencorvus-benchmark/reproduction-20260912/native \
  --base-root /var/lib/opencorvus-benchmark/reproduction-20260912-scheduler-fix/base \
  --manifest /mnt/d/myhexin-local/opencorvus/specs/artifacts/opencorvus-paper/experiments/luna-base-2026-09-12/case-manifest.json \
  --port 8765
```

The viewer's backend projection tests run with `python -B -m unittest discover -s script/benchmark -p test_reproduction_dashboard.py`. Visual acceptance uses actual browser interaction and screenshots; no UI automation tests are used.

## Scheduler correction

The initial Base batch exposed a scheduler send deadlock: a Tool awaited the recipient drain, while the recipient could be waiting for that sender's Tool to finish. The failed attempt remains in its original evidence directory. The correction makes the durable enqueue receipt the send boundary for requests, replies and notifications; delivery and recovery stay with the existing inbox/drain owner.

[`scheduler-send-enqueue-receipt.patch`](scheduler-send-enqueue-receipt.patch) records the same correction and a positive busy-recipient regression test against frozen runtime `17bc3f63fc2ed0e2d4953e50811ee106882fd8fe`. The current paper branch carries its production correction directly in `src/protocol/scheduler-message.ts` and the Task materializer. The patch is a reproducible historical runtime delta, not a second production implementation. Apply it only to the exact clean frozen revision, after its active trials have ended. Corrected-runtime validation and experiment identity are recorded in the [protocol](../../../../records/2026-09/2026-09-12-luna-base-reproduction.md#base调度发送阻塞修复方案); old and corrected runtime results must be distinguished.

## Frozen sample

`case-manifest.json` contains the first 100 identities from the existing 600-case manifest, in its original order. SHA-256: `43ca54925db11d7dc6d9c5b80bbd32aed9b6c93ea92a2d1b8225a0858036ff42`. Before the first new case, the retained official dataset-index digest was added to the metadata; membership and order are unchanged.

| Domain | Tasks |
| --- | ---: |
| Marketing | 15 |
| Finance | 13 |
| Support | 15 |
| Sales | 20 |
| Operations | 21 |
| Human resources | 16 |

Both conditions use these exact identities. This is a historically exposed reproduction set, not an unseen test set. Selection did not filter by outcome. Task contracts and official package identity are checked before execution.

## Historical score recovery

`historical-score-audit.json` and `historical-score-cases.jsonl` are fresh read-only verification results for the local r3 evidence directory. All 102 catalog candidates passed sealed-file hashes, recorded run/model/profile identity, the official task contract, and the retained replay checker. The checked candidates span 15 OpenCorvus source revisions.

Of those candidates, 95 were members of the original completed-batch leaderboard; their 27 strict passes were recomputed. This 27/95 snapshot is distinct from the previously reported operator-confirmed 34/100 aggregate. The audit does not recover the missing identity of that exact historical aggregate, validate all runtime eligibility conditions, or create a native Luna baseline. Stateful tool effects are checked through the retained hash chain and final-world scoring, not by replaying each mutation.

`native-world-check.json` records an actual official `simple`-domain transport/scoring check with zero model calls. Its strict zero is an expected diagnostic result because the check only exercises base64 encoding and API search. Simple cases are excluded from the scored 100-case experiment.

## New execution checkpoint

After the user reauthenticated and authorized execution, `provider-preflight.json` records a real streaming connection to exact `openai/gpt-5.6-luna`. The first new native case has completed: `native-case-001-receipt.json` records strict/partial score 1, official replay pass, 23 response steps, 46 tool calls and 133,417 ms. Every recorded request uses `gpt-5.6-luna`, with explicit medium reasoning. The receipt hashes all 11 raw evidence files and records credential-scan acceptance. This is a single-case chain validation, not the 100-case aggregate or an observed paired advantage. Base's first five-case batch is running with two concurrent case slots; its paired outcomes remain pending.

## Reproduce the preparation checks

The existing AutomationBench Python environment must match the pinned package-tree digest in the manifest. Materialize `automationbench_bridge.py` and `verify_automationbench_replay.py` from historical harness commit `17bc3f63fc2ed0e2d4953e50811ee106882fd8fe` into an explicit local directory. The audit receipt records the actual checker/bridge byte hashes; the first local export used PowerShell UTF-8 text output.

From repository root, with a fresh output directory:

```text
python -m unittest discover -s script/benchmark -p test_recover_automationbench.py
bun test ./script/benchmark/native-run-contract.test.ts
python script/benchmark/recover-automationbench.py --root <original-evidence-root> --harness <checker-directory> --harness-revision 17bc3f63fc2ed0e2d4953e50811ee106882fd8fe --output <new-audit-directory>
python script/benchmark/check-native-automationbench-world.py --harness <checker-directory> --output <new-check-directory>
bun build script/benchmark/run-native-automationbench.ts --target bun --packages external --outfile <scratch-output.js>
bun run docs:check
```

The native model runner's initial real path has passed the official checker on one case. The first-case evidence is undergoing independent review before expansion. Base launch and both arms' final receipts, actual settings and inference budgets must be verified before publishing a paired aggregate. The historical Base protocol uses its original 50-case manifest/shell for cases 1–50 and the extended manifest/shell for 51–100; both preserve the same case identities as the native 100-case manifest. The primary reasoning setting is medium; organization-specific helper settings and the native 50-step versus Base uncapped budget remain explicit differences.
