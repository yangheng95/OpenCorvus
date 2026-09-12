# Luna versus Luna + Base reproduction

Protocol and current execution status: [dated record](../../../../records/2026-09/2026-09-12-luna-base-reproduction.md).

## Local results page

Open [the current correction comparison](http://localhost:8766/ui) on the experiment machine. It updates every 30 seconds from the native results and Base's existing catalog/leases. It shows scored denominators, running/awaiting states, per-case results, and comparisons only for completed pairs. The localhost viewer exposes only selected summary fields and does not serve raw files, prompts, logs or credentials.

The original e03f baseline viewer remains at [port 8765](http://localhost:8765/ui). The new viewer uses the new configuration's WSL evidence root, without restarting the prior viewer or user page:

```bash
/var/lib/opencorvus-benchmark/evaluator-venv/bin/python -B \
  /mnt/d/myhexin-local/opencorvus/script/benchmark/reproduction_dashboard.py \
  --native-root /var/lib/opencorvus-benchmark/reproduction-20260912/native \
  --base-root /var/lib/opencorvus-benchmark/reproduction-20260912-outcome-first/base \
  --manifest /mnt/d/myhexin-local/opencorvus/specs/artifacts/opencorvus-paper/experiments/luna-base-2026-09-12/case-manifest.json \
  --port 8766
```

The viewer's backend projection tests run with `python -B -m unittest discover -s script/benchmark -p test_reproduction_dashboard.py`. Visual acceptance uses actual browser interaction and screenshots; no UI automation tests are used.

## Scheduler correction

The initial Base batch exposed a scheduler send deadlock: a Tool awaited the recipient drain, while the recipient could be waiting for that sender's Tool to finish. The failed attempt remains in its original evidence directory. The correction makes the durable enqueue receipt the send boundary for requests, replies and notifications; delivery and recovery stay with the existing inbox/drain owner.

[`scheduler-send-enqueue-receipt.patch`](scheduler-send-enqueue-receipt.patch) records the same correction and a positive busy-recipient regression test against frozen runtime `17bc3f63fc2ed0e2d4953e50811ee106882fd8fe`. The current paper branch carries its production correction directly in `src/protocol/scheduler-message.ts` and the Task materializer. The patch is a reproducible historical runtime delta, not a second production implementation. Apply it only to the exact clean frozen revision, after its active trials have ended. Corrected-runtime validation and experiment identity are recorded in the [protocol](../../../../records/2026-09/2026-09-12-luna-base-reproduction.md#base调度发送阻塞修复方案); old and corrected runtime results must be distinguished.

## Outcome-first correction and cost baseline

The [runtime correction](../../../../records/2026-09/2026-09-12-outcome-first-runtime-correction.md) changes the shared goal/delegation guidance, Base's ordinary workflow to executor → independent verifier, report transport, and the historical environment Skill's responsibility. These are jointly changed conditions; a retest cannot isolate the causal contribution of any one change.

`scheduler-fix-first-five-score-audit.json` independently checks all five e03f sealed cases, task/source identities, and the official replay checker: strict 1/5, partial scores 0, 0.5, 1, 0, and 0.81818; durations 33.00, 19.95, 21.53, 17.06, and 38.83 minutes. Internal acceptance and score validity do not imply business success.

`publication-overhead-baseline-first-five.json` measures 48 standalone publishing-session selections, 540 Provider requests, and 737 Tool calls from sealed inputs. `publication-overhead-baseline-first-two.json` preserves the preregistered initial two-case baseline of 17 removable selections; the corrected measurement produces the same 17. The metric keeps selections used by any other consumer, including failed consumers, and counts unused publishing-session selections. It measures a specific transport overhead, not all redundancy or overall speedup. Retests must report total calls, score, and elapsed time alongside this metric.

`outcome-first-runtime.patch` is the 268,627-byte historical-runtime delta against clean e03f; SHA-256 `fffaa66226690460734bc1bd6ccdafcc4d3e13cbb0140812b8b220f8a77185f1`. `outcome-first-runtime-receipt.json` records clean commit `3f9cb474b577f6e313492ed48b5b4bbf1bfa4f1f` and its tree. Apply it after the earlier scheduler correction, never during an active trial. New evidence is under `/var/lib/opencorvus-benchmark/reproduction-20260912-outcome-first/base`; the e03f evidence remains intact. Both Base and SquadSDK are version 2026.09.12.2.

```text
python -B -m unittest discover -s script/benchmark -p test_measure_publication_overhead.py
python -B script/benchmark/measure_publication_overhead.py --root <sealed-base-root> --cases 1,2,3,4,5 --runtime-commit <exact-commit> --output <new-measurement.json>
```

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

## Runtime readiness correction

[stream-progress-observer.patch](stream-progress-observer.patch) and its [receipt](stream-progress-observer-receipt.json) freeze the owned Session activity observation correction at `470d129d`, relative to `3f9cb474`. The observer consumes the existing semantic monitor; polling and lease renewal do not renew the inactivity window. Zero-model processor integration and independent review passed. New benchmark admission remains paused: actual two-role condition verification is incomplete, and the original failed Provider stream cannot be reconstructed from retained evidence. See the [readiness record](../../../../records/2026-09/2026-09-12-benchmark-runtime-readiness.md).


[base-workflow-subject-clarification.patch](base-workflow-subject-clarification.patch) records the Base 2026.09.12.3 prompt clarification against runner 470d129d: use the declared Developer workflow node followed by independent Tester. Package projection checks passed; model adherence is still unverified and new benchmark admission remains paused. The public direct binding contract is unchanged.


## Outcome-first evidence revalidation

[Execution condition audit](outcome-first-execution-condition-audit.json) retains all five cases: only cases 2 and 4 satisfy the declared executor/verifier condition. Cases 1 and 5 used direct dispatch; case 3 failed. This is a condition-compliance metric with a fixed denominator, not a replacement score or a reason to discard failed cases. [Official score audit](outcome-first-score-audit.json) and [per-case results](outcome-first-score-cases.jsonl) independently recompute all four sealed scores: partial 0.8, 0.5, 0.631578947368421, 1.0 for cases 1, 2, 4, 5; case 5 is the only strict pass. The score utility retains its historical audit label; all four source revisions in this invocation are 3f9cb474 and no model was invoked.

Reproduce condition verification with `python script/benchmark/audit_execution_condition.py --root <outcome-first/base> --manifest <case-manifest.json> --cases 1,2,3,4,5 --runtime-commit 3f9cb474b577f6e313492ed48b5b4bbf1bfa4f1f --workflow execution-verification --executor base-developer --verifier base-tester --output <new-report.json>`. Official replay uses `recover-automationbench.py --root <outcome-first/base> --manifest <case-manifest.json> --harness <checker-directory> --harness-revision 84a0919412616bbd76213ee1715a7e8b8a54f5ac --output <new-audit-directory>`. Both commands preserve original evidence.

The controlled first-five diagnostic at [localhost:8767/ui](http://localhost:8767/ui), source84a09194/Base.3, batch3ab2a1e3-a714-4dad-90bc-e3547468d7f5, has ended. Cases 1, 2, 4 and 5 are invalid; case 3 remains a sealed candidate rather than an audited completed batch. Old 8765/8766 viewers retain their prior roots.

## Current-source recovery verification

The active implementation is now maintained in `packages/opencorvus/script/benchmark/external-agent` on this paper branch, importing the same checkout's production runtime. The old runner lacked the current dispatch replay protocol. Do not apply further selective runtime backports or launch the old readiness script. Both execution entry points now require an explicit `--case-set`; use this directory's fixed 100-case `case-manifest.json`. The retained 50-case file is a historical prefix reference used by the evidence catalog, not the selected experiment. Every new batch binds its runtime commit, harness digest and selected manifest digest; reuse only matches that exact identity.

From `packages/opencorvus`, the focused zero-model command is:

```text
bun test --timeout 120000 test/mission-streamed-recovery.test.ts test/session/processor-producer-boundary.test.ts test/benchmark/runtime-source-identity.test.ts test/storage/schema-contract.test.ts test/orchestrator-streamed-dispatch-settlement.test.ts test/session/processor-llm-activity-retry.test.ts
```

The 25 checks / 120 assertions passed. The single Mission scenario enters real streaming SDK execution, commits an operation, injects a socket error, preserves the unsafe-retry guard, opens the Mission acceptance gap, continues the same Developer Session, first starts an independent Tester, reads its real report and completes Task/Mission acceptance. Its runtime snapshot and ordinary isolated teardown also pass. Separate producer/consumer and cancellation checks cover execution before observation and cancellation during step preparation. This proves deterministic runtime recovery, not external Provider availability or an improvement in the official scores. The source migration also uses the shared finalized SQLite reader so snapshot connections release their statements before cleanup.

The real AutomationBench 1.0.6 bridge and official scorer replay passed without a model request. The condition auditor's 18 checks passed using the canonical initial lineage, each input occurrence and terminal settlement; it no longer requires the removed node-occurrence table. The old static report was visually inspected and omitted from the migrated runner because it hardcoded a 50-case display and historical public comparisons. The existing `script/benchmark/reproduction_dashboard.py` remains the comparison viewer. TLS origin, new controlled Provider execution, the requested call reduction and the 100-case comparison remain unverified.
