# Delivery: CSV import preview consistency

## Model and scope

Implementation model: `openai/gpt-5.6-luna`. This delivery changes only the
local Actual source snapshot and its backend tests/specifications. No bank
connection, credential, real financial data, upstream patch, or UI automation
is included. Operator acceptance is recorded separately below.

## Diagnosis and acceptance history

The import modal marks a row chosen as new with the transient
`forceAddTransaction` flag. `normalizeTransactions` previously rebuilt the
transaction from the remaining properties and dropped that flag. Matching
therefore still won and the final import updated the existing candidate
instead of inserting the preview-selected row.

Independent manual acceptance then reproduced the original failure on a fresh
account: Netflix (`2026-09-10`) remained alone at `-8.99` while selected Corner
Coffee (`2026-09-08`) disappeared. The preview had excluded Netflix from the
final payload, so reconciliation was free to fuzzy-match Coffee back to
Netflix. The complete repair therefore applies the same transient force-add
marker to every selected, non-merge row, including an ordinary new preview
row.

## Changes

- `packages/loot-core/src/server/accounts/sync.ts`: preserve the transient
  force-add marker through normalization; insertion still removes it before
  database writes.
- `packages/loot-core/src/server/accounts/sync.test.ts`: add positive database
  output tests for selected-new insertion against a manual candidate,
  imported-baseline duplicate plus new row, explicit merge, skipped empty
  input, and fuzzy duplicate matching. The two scenario tests use the exact
  fictional values: Netflix `-8.99` on `2026-09-10` and Corner Coffee `-8.99`
  on `2026-09-08`, with a persisted transaction total of `-17.98`.
- `packages/desktop-client/src/components/modals/ImportTransactionsModal/utils.ts`:
  convert the actual preview selection state into the force-add marker before
  the final payload is sent.
- `packages/desktop-client/src/components/modals/ImportTransactionsModal/ImportTransactionsModal.tsx`:
  use that selection conversion in the real import path.
- `packages/desktop-client/src/components/modals/ImportTransactionsModal/utils.test.ts`:
  verify ordinary selected-new, skipped, and merge state conversion.
- `specs/implementation-plan.md`, `specs/Recall.md`: record plan and invariant.

## Verification

- `node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core exec vitest --run src/server/accounts/sync.test.ts`
  — pass, 28 tests.
- `node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core exec vitest --run src/server/transactions/import/parse-file.test.ts`
  — pass, 10 tests.
- `node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core run typecheck`
  — pass, 209 strict files.
- `git diff --check` — pass for the working-tree patch.
- Exact-value assertions: manual baseline and imported baseline each read two
  persisted rows, Netflix dated `2026-09-10` and Corner Coffee dated
  `2026-09-08`, at `-8.99` each and calculated transaction balance `-17.98`.
- `node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web exec vitest --run src/components/modals/ImportTransactionsModal/utils.test.ts`
  — pass, 111 tests.
- Latest date-precision rerun: the core sync command above passed 28/28 after
  changing the imported control to Netflix `2026-09-10` and Corner Coffee
  `2026-09-08`; the desktop utility command passed 111/111, and
  `git diff --check` passed.
- The repository formatter executable was not present in the focused
  dependencies; no dependency installation was performed.

## User-facing before/after

Before: changing a matched CSV row to “new” could still reconcile it into the
existing transaction because the decision marker was lost before matching.
After: the marker reaches reconciliation, so that selected row is inserted;
ordinary imported-ID/fuzzy duplicates and explicit merges retain their prior
behavior.

## Acceptance boundary and limitations

No UI automation was created or run. The existing real page must be manually
checked by the operator after the core development build is refreshed. Hosted
version behavior and any external proposed patch were not used as evidence.
The exact-value backend evidence does not constitute operator UI acceptance.
The prior manual UI acceptance failure is retained as acceptance evidence; a
successful explicit core Vite development build was the intervention used for
the recheck, and the latest operator recheck passed both fresh paths: `Luna
final manual 0419` and `Luna final imported 0419` each contain Netflix on
`2026-09-10` and Corner Coffee on `2026-09-08`, with balance `-17.98`. This is
operator-maintainer evidence, not independent review, adoption, or unattended
execution. Independent read-only review remains unresolved.
