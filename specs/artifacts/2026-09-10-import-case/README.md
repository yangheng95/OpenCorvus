# Import preview consistency — qualified case input

Status: the reported failure was reproduced manually in Actual's official hosted application, which identified itself as v26.9.0. This is a candidate input for a future OpenCorvus workflow, **not an OpenCorvus repair or model success**.

## Problem and user value

A user excludes a duplicate and imports a row explicitly displayed as new. The account should contain that new transaction. In the reproduced manual-baseline path, the new row disappears and the account remains unchanged. A useful delivery must restore agreement between preview and actual results while preserving legitimate duplicate handling.

Original report: [Actual issue8464](https://github.com/actualbudget/actual/issues/8464). There is an existing [open WIP PR8468](https://github.com/actualbudget/actual/pull/8468); this issue is not our discovery. Do not copy its patch and describe the result as an independently solved model challenge. Actual is the input project, not a customer or endorsement.

## Reproduction observed on 10 September 2026

Open [Actual's official application](https://app.actualbudget.org/) in a fresh browser context. Its welcome screen reports v26.9.0 and Server N/A. Choose Start budgeting, use only local fictional data, and keep server/bank sync unconfigured.

1. Create a blank account. Manually add Netflix, payment8.99, date2026-09-10, notes Subscription.
2. Import [preview-divergence.csv](preview-divergence.csv). Keep Merge with existing transactions enabled and the parsed date format YYYY-MM-DD.
3. Observe Netflix in the merge state with an existing-row preview underneath; Corner Coffee has the plain new-row plus indicator.
4. Click Netflix's three-state toggle twice: merge -> new -> skipped. Coffee remains selected and the action reads Import1transactions.
5. Import. Observed final state: Netflix remains the only transaction, account balance-8.99. Expected accepted state: Netflix and Corner Coffee, balance-17.98.

The dates are fixed sample data within two days of each other. If a future version applies additional date filters, inspect them and document any change rather than silently changing the scenario.

## Essential successful control

In a separate empty account, first import [baseline.csv](baseline.csv) instead of entering Netflix manually. Then import the two-row CSV. Observed preview automatically skips the duplicate and selects Coffee; final account has both rows and balance-17.98. This control passed in the same hosted version and browser session. It does **not** establish that the manual-baseline problem is fixed.

The real page screenshots and readbacks were reviewed in the operating task. These files retain inputs and written observations; they are not a screenshot archive or a recorded model execution.

## Future delivery acceptance

- Pin the isolated source revision and reproduce the manual-baseline problem there. The hosted v26.9.0 build has not been source-mapped to the previously inspected12f4b6e2 snapshot.
- Requirements must explicitly cover both manual and imported existing transactions, selected/skipped rows, and legitimate merge behavior.
- After repair, the manual-baseline path must show Netflix and Corner Coffee with account balance-17.98. The imported-baseline control must retain the same correct result.
- Verify backend transaction outputs with positive checks and inspect the actual UI manually. No UI automated tests are authorized by this repository's workflow.
- Record the actual implementation artifact, independent review findings, acceptance results and a substantive user-feedback revision through OpenCorvus. Do not invent review objections or claim unattended success.
- Name the actual model, interventions and unresolved items. Quantify savings only if a real baseline was measured. A maintainer demonstration does not count as independent adoption.

No model run, patch, upstream message, paid service or bank connection was performed during qualification. The original issue remains open. [Operating record](../../records/2026-09/2026-09-08-founder-operations.md).
