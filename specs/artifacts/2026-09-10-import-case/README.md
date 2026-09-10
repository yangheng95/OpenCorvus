# Import preview consistency — qualified case input

Status: the reported failure and successful control were reproduced manually in both Actual's official hosted v26.9.0 application and local source revision `12f4b6e22dd54e0a66324271235454f450cbbf99`. This is an input for a future OpenCorvus workflow, **not an OpenCorvus repair or model success**.

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

- Local baseline now qualified at `12f4b6e22dd54e0a66324271235454f450cbbf99`: both paths match the observations above. Repeat in fresh accounts for the actual model run; prior failed imports can mutate matching metadata. The hosted v26.9.0 build has not been mapped to an exact source commit.
- Requirements must explicitly cover both manual and imported existing transactions, selected/skipped rows, and legitimate merge behavior.
- After repair, the manual-baseline path must show Netflix and Corner Coffee with account balance-17.98. The imported-baseline control must retain the same correct result.
- Verify backend transaction outputs with positive checks and inspect the actual UI manually. No UI automated tests are authorized by this repository's workflow.
- Record the actual implementation artifact, independent review findings, acceptance results and a substantive user-feedback revision through OpenCorvus. Do not invent review objections or claim unattended success.
- Name the actual model, interventions and unresolved items. Quantify savings only if a real baseline was measured. A maintainer demonstration does not count as independent adoption.

No model run, patch, upstream message, paid service or bank connection was performed during qualification. The original issue remains open. [Operating record](../../records/2026-09/2026-09-08-founder-operations.md).

## Prepared local environment

Source archive SHA-256: `9367411f32f5ca2b3cf9f0ae1887faa8f15452eb8c19ba08339e20cf27c8c4de`.

After installation, builds and manual reproduction, all 4,111 regular files in the original archive were compared by SHA-256 against the extracted source: zero changed and zero missing. Generated dependencies/build outputs are additional local files and are not covered by that source comparison.

Windows source directory: `%TEMP%/opencorvus-actual-case-12f4b6e2/source/actual-12f4b6e22dd54e0a66324271235454f450cbbf99`. It is a plain extracted source snapshot, not a Git worktree. Node24.16.0 and bundled Yarn4.17.1 were used. Run all commands below from that source root.

```powershell
node .yarn/releases/yarn-4.17.1.cjs workspaces focus @actual-app/web @actual-app/core plugins-service
node .yarn/releases/yarn-4.17.1.cjs workspace plugins-service run build-dev
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core exec vite build --config vite.config.mts --mode development
$env:REACT_APP_BACKEND_WORKER_HASH = 'dev'
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web run start --mode=browser --host 127.0.0.1 --port 46421 --strictPort
```

The existing Windows frontend launcher logs `spawn yarn ENOENT` for its automatic core child. The explicit core build above produces the same development worker through the existing build entry and allowed the real page to initialize. This is a prepared snapshot, not a repaired upstream launcher: after modifying core source, rerun that build before checking the page, or use its existing `--watch` mode in a separate terminal. Do not infer that the failed automatic child is watching changes. Do not alter any pre-existing user process to start the preview.

The two local accounts are named `Pinned source manual baseline` and `Pinned source imported control`, with final observed balances-8.99 and-17.98 respectively. They contain only the fictional inputs above. Keep qualification, model implementation and acceptance evidence separate.
