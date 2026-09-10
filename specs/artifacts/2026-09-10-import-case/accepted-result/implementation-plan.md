# CSV import preview consistency repair

## Scope

Repair the bounded CSV import path so a transaction that the preview marks as
new is inserted, while imported-ID and fuzzy duplicate matching and explicit
merge updates remain unchanged. Add backend tests for the preview decision
contract; no UI automation is in scope.

## Diagnosis

The import modal sends `forceAddTransaction` when a matched row is selected as
new. `reconcileTransactions` checks that flag before applying a match, but
`normalizeTransactions` reconstructs each transaction from `rest` and the
normalization pipeline therefore drops the flag before the check. The final
pass then treats the selected-new row as the existing match and updates it.

## Implementation

Preserve the transient `forceAddTransaction` marker through normalization and
the rules/matching passes. Keep removing it before insertion so it cannot be
stored as a transaction field. Add focused positive tests covering manual and
imported baselines, selected-new insertion, skipped no-op, explicit merge,
and legitimate duplicate matching.

## Verification

Run the focused core test file with the bundled Yarn command. Do not create or
run UI automation. Manual UI acceptance remains an operator responsibility.
