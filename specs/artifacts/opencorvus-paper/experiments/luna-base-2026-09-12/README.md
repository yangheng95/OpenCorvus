# Luna versus Luna + Base reproduction

Protocol and current execution status: [dated record](../../../../records/2026-09/2026-09-12-luna-base-reproduction.md).

## Frozen sample

`case-manifest.json` contains the first 100 identities from the existing 600-case manifest, in its original order. SHA-256: `d2ebf899b3314d996c084be70d55ce3c5defc07277f56b12643b26aedb051c21`.

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

No new model result is reported here. `native-world-check.json` records an actual official `simple`-domain transport/scoring check with zero model calls. Its strict zero is an expected diagnostic result because the check only exercises base64 encoding and API search. Simple cases are excluded from the scored 100-case experiment.

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

The native model runner is under implementation review. Build success and the world check do not establish live model-path acceptance. Exact runtime identity, shared reasoning settings, actual Provider model, inference budgets, full receipts, and the Base launch path must be verified before publishing a paired result.
