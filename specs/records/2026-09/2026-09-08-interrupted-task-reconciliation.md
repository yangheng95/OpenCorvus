# Interrupted task reconciliation

## Recall

- User request: “检查还有那些中断任务没有完成，一起解决”. Interpret this as the current OpenCorvus project's prior Codex development and acceptance tasks; a scope clarification is pending. Application-owned Mission/Task execution is not yet part of this inspection.
- Baseline: `5a032ee36b4601c88a5328983b779037dcc969b5`, branch `v0.0.55beta`, initially equal to the local upstream tracking ref. Preserve the pre-existing Session formatting/comment diff and both Web content diffs.
- Acceptance: distinguish task status from delivered code; verify later closure commits and actual checker receipts; finish confirmed local repairs with focused positive tests and independent read-only review; retain exact unresolved acceptance boundaries.
- Constraints: no user database deletion/reset, user-process operation, new branch/worktree, Provider invocation, benchmark restart or publication. Historical stopped benchmark and static-only visual instructions remain applicable. No UI automation.
- Read: repository AGENTS.md; August 10 checklist record; August 12 code-smell audit/program; August 13 compact-identity record; August 24 architecture reconciliation; August 30 scheduling closure; September 5 technical direction and scheduling records; September 6 release record; current Identifier, Build terminal publication, Evolution mutation, Artifact persistence and startup integrity code.
- Search: 37 other project tasks returned by the available recent/pinned inventory; latest turn summaries and later repository records. This is not an exhaustive inventory of archived tasks. Whole-repository production/test searches locate the two remaining expanded Artifact ID issuers, their persistence/replay consumers and existing startup compact-identity checks.
- Independent agent feedback before implementation: 无. Mandatory uninvolved read-only delivery review follows initial validation.

## Reconciled findings

| Item | Current evidence and disposition |
| --- | --- |
| Hosted Windows test-budget acceptance, TD-08 | Actual unit run `34180349461`, source `5a032ee36`, Windows job `101917997629`, completed successfully on September 8. The old outstanding-hosted-verification label can close. |
| Hosted macOS log flush acceptance, TD-10 | Same exact source/run, macOS job `101917997524`, completed successfully. Linux and aggregate jobs also passed; build check `34180349450` and typecheck `34180349426` passed. Reading existing results did not rerun UI tests. |
| Interrupted scheduling audit and A22-A24 continuation | Later current ledger records the closed A1-A24/B1-B9/C1-C2 campaign. Directory fencing `8c305720` and Workspace lifecycle `7f725d0` are ancestors of current HEAD. Historical rejected tree `f93c6ca` was superseded; it is not an outstanding implementation candidate. |
| Old local-only stream retry, README and capability-route repairs | `cdabaec0c`, `368c4ab61` and `6ce13a351` are present in the current upstream tracking ancestry. Their old push-blocked messages do not describe today's delivery state. Live Git fetch initially failed with `schannel: failed to receive handshake, SSL/TLS connection failed`; final remote verification must be recorded separately. |
| Checklist and code-smell audit tasks with interrupted metadata | Checklist record contains real-page drag/persistence/export evidence and production-route acceptance. August 24 explicitly maps/rejects/reconciles the historical code-smell register; do not revive all 60 old queued labels as 60 confirmed current defects. This is historical reconciliation, not a new exhaustive code-smell audit. |
| Compact identity continuation | Build terminal and Evolution mutation receipt repair delivered and pushed in `03ec8f23c`, with 23/23 focused tests and independent FINAL PASS. The remaining issuers and Phase 2 model-facing digests are tracked below. |
| Light real consultation | Later known-ref fixes supersede the August 30 failures. Latest recorded acceptance stopped before Task creation at Provider HTTP 401 `token_revoked`. Current performance remains unverified; no new credential use or paid run occurred. |
| Dock and native startup visual acceptance | Static repairs were committed/reviewed. Dock's latest instruction prohibited computer operation; handoff-startup native acceptance lacked a compatible complete payload. Neither historical build nor CI success proves the missing final native screenshots. |
| Website typography continuation | Retrieved interrupted message stops at proposed Chinese line-break measurement. Current visual acceptance is not established by that message; keep this follow-up open pending exact page/revision reconciliation. |
| AutomationBench / evolution runs | Later task messages explicitly stop or withhold reauthorization for real runs. Preserve those boundaries and historical evidence; do not restart from stale WSL checkpoints or treat lifecycle completion as answer quality. |
| Old destructive cleanup requests | Read-only path checks found all three named user database files and six old `.r` subdirectories absent. No deletion or reset was executed here; this does not establish how or when those paths disappeared. |

## Compact Artifact repair analysis and plan

Observable issue: the two deterministic issuers bypass `Identifier.MAX_LENGTH = 24`, producing expanded IDs used in exact Artifact locators and durable mutation/Build cleanup receipts. The prior slice fixed Mission caller receipts only, so the remaining issuers were not cured.

The identity material must stay complete and domain-separated while its public business key uses the existing `Identifier.deterministic("artifact", material)`. Payload SHA-256, authorization Message SHA-256, Git refs and package digests remain complete integrity facts. No new alias registry, dual read or compatibility path is permitted.

Before implementation, complete the caller/persistence audit for Build observation cleanup, successful/partial publication, Evolution promotion/restoration/feedback, exact replay, collision integrity and startup admission. Old expanded persisted keys cannot silently produce a second receipt under a compact key; extend the existing explicit data-reset admission using exact family provenance. Do not reset any database. Tests use isolated storage and actual production writers/readers; include compact successful publication/replay and the explicit reset/collision error contracts. No scheduling policy changes are intended; if ownership or settlement defects are observed, expand the audit across their shared production entries before editing.

Implementation order: finish the read-only contract audit; repair the two issuers and their single startup admission; update focused positive production-path tests; run the affected complete files, package typecheck and documentation checker; independent read-only review; correct valid findings; commit only this task's changes and attempt ordinary upstream merge/push with normal hooks.

## Implementation and verification

The caller audit confirms one Build issuer feeds the production adapter, exact success/partial writer and durable cleanup identity. Publication already compares full persisted payload/task/kind identity. Evolution promotion, restoration and feedback share one receipt issuer; its replay reader previously checked only partition/type/producer and could accept a forced same-partition identity collision. The correction compares complete canonical authorization/target/revision/evidence identity before Manager reconciliation, and uses a typed collision error. The transactional writer also checks Task partition and kind. Manager's filesystem journal continues to use its exact durable receipt identity: a committed prior receipt is rejected at database admission; an uncommitted journal is recovered by the existing rollback path rather than interpreted as a second receipt.

Both issuers now use the existing compact deterministic primitive. Database admission covers successful and partial legacy Build publications, unpublished legacy cleanup owners, and provenance-bound Evolution receipts. No user database was opened, reset or deleted. Four old absence-only assertions encountered in the touched Build test were removed; the retained tests still assert successful physical Build, exact receipts, cleanup settlement, restart and deletion outcomes.

The first new startup-fixture run failed four cases because the fixture omitted its existing local Provider model adapter. Installing that same fixture adapter corrected the setup; no production Provider credentials were used. The first typecheck found that the public receipt schema admits broader locator kinds than the actual prepared Evolution mutation contract. The reader now explicitly validates the canonical engine-Artifact evidence kind before comparing complete digests.

Final focused validation: `bun test --timeout 120000 test/build-terminal-fact-publication.test.ts test/expert-squad-evolution-mutation.test.ts test/expert-squad-feedback-revision.test.ts` passes 23/23 with 77 assertions in 108.01 seconds. The full package typecheck exits zero. These tests cover real Git/storage/Manager paths with local Provider adapters, not paid Provider quality or visual acceptance. Documentation and architecture-index checks pass.

Uninvolved read-only review of the complete 11-file implementation tree `d4edb966cd8a555182a03d1a5723fec97d9b6527` returned FINAL PASS, with no unresolved findings. The reviewer independently reran the Evolution mutation file: 1/1, 23 assertions, 9.38 seconds. The same index passed release topology (five authorities) and module topology (1,105 modules, 5,569 runtime edges, zero retained strongly connected components, four clean imports). This final record adds only the review/checker results after that review; production and test bytes remain identical. Git commit and ordinary push follow, with final revision/status reported in the task response.

Ordinary Git's Windows TLS backend failed during fetch; a per-command OpenSSL backend fetch succeeded with certificate verification enabled, and current branch/upstream remained 0/0. No global Git configuration changed.

## Cut 2 Recall: feedback candidates and Goal Workload identity

- User continuation: “继续处理”. Continue the prior development/acceptance ledger; credential, stopped benchmark and static-only native UI boundaries remain unchanged.
- Baseline: `03ec8f23c`, current branch/upstream 0/0; the same three working-only paths remain excluded.
- Acceptance: complete the next proven expanded Artifact families through their actual publication, replay and startup contracts; retain full integrity facts and return explicit collision/reset errors. Preserve existing Goal Workload coverage and all manager mutation semantics.
- Read/search: original compact-ID plan and current data architecture; all `goalWorkloadPublicationArtifactID` definitions/callers (publisher, store, startup relational integrity); feedback candidate persistence and its invocation from feedback authoring; all current expanded Artifact prefix/hash constructors in core; complete relevant positive tests and prior explicit data-reset checks.
- Independent feedback before implementation: 无; uninvolved delivery review follows focused verification.

### Analysis and chosen change

Feedback candidate publication still constructs `art_feedback_revision_<64hex>` from its canonical envelope. Goal Workload still constructs `art_goal_workload_<64hex>` from Task/dispatch; its current test explicitly expects the obsolete format. These are separate, still-live callers outside the first Build/Evolution receipt slice. They enter exact locators, Task history and model evidence, contradicting the 24-character business identifier contract.

Use the existing domain-separated deterministic Artifact primitive for each complete identity material. Feedback's complete envelope and Task partition are validated on replay, with a typed collision error before returning a locator. Goal Workload already compares Task, kind, dispatch, producer and raw briefs, then validates complete relational lineage; retain that one authority. Its existing startup coverage checker recalculates the publication identity, so legacy Goal Workload IDs already receive `DATA_RESET_REQUIRED` through that checker after the generator changes. Do not add a second scan or migrate immutable provenance. Feedback legacy candidates join the existing provenance-bound compact Artifact startup check.

Tests: actual feedback package candidate publication/replay and controlled collision, preserving full candidate digest; actual Goal Workload publication/replay/reader and cross-process matrix; explicit startup rejection of old candidates and old Goal Workload rows through production database admission. Remove the encountered absence-only `not.toThrow` assertion and retain the positive reloaded coverage fact. No new scheduling, schema, authorization, UI or filesystem journal mechanism is required. No user database is reset.

Validation and delivery: focused complete files, package typecheck, docs/architecture checks, independent read-only review, scoped commit and ordinary fetch/merge/push before proceeding to the next slice. Phase 2 raw digest tools and website visual reconciliation remain separately open.

Cut 2 implemented the two canonical issuers, feedback partition/envelope collision checks and provenance-bound startup admission. Goal Workload retained its existing publisher/reader/startup integrity authority. Both legacy tests publish through actual production writers with a controlled prior-format issuer, then reopen through the real database client; no handcrafted incomplete receipt or user database is used. The complete feedback and Goal Workload files pass 36/36, 83 assertions, 111.19 seconds, including real cross-process publication/settlement and package revision/restoration. Package typecheck and docs pass. Independent review and scoped delivery are pending.

The subsequent inventory still finds Automation/Event handcrafted occurrence identities and snapshot identifiers; their coupled Message/Session/run graphs require a distinct occurrence analysis rather than a search-and-replace. `panel.create_task.expectedPackageDigest` also remains, and existing Artifact references are backed by Tool-result provenance rather than a generic alias store. These facts constrain the next slice and are not marked repaired here.

Cut 2 uninvolved read-only review returned FINAL PASS for tree 8abefff3e4b0451ad7173fb81478ae8e8a152f07, with no unresolved findings. The reviewer independently reran feedback (8/8, 28 assertions) and the genuine prior-format Goal Workload startup case (1/1, 2 assertions), and confirmed the three unrelated working-only files remain excluded. Production and test bytes are unchanged after review; this addition records evidence only.
