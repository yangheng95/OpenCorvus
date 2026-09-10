# From a misleading import preview to a checked repair

OpenCorvus, using `openai/gpt-5.6-luna`, produced a repair in a pinned Actual Budget source snapshot. The original manual-baseline failure and the imported-baseline control both passed operator page acceptance after a failed first attempt and explicit feedback. This is one maintainer demonstration, not independent adoption or an unattended success claim.

## What changed for the user

Before: skip a duplicate Netflix transaction and import Corner Coffee, displayed as new. The account still contains only Netflix, balance **-8.99**.

After: the same preview choices retain Netflix and add Corner Coffee, balance **-17.98**. Importing the baseline from CSV first also preserves correct duplicate handling. The fictional dates are Netflix **2026-09-10**, Coffee **2026-09-08**; both payments are **8.99**.

中文：用户在预览中明确选择新增的记录，最终应真正新增。第一版只修了后端标记传递，真实页面仍失败；将失败反馈给同一任务后，第二版补上了普通新增行的预览到提交转换。两个全新账户均通过页面验收。这个案例展示的是计划、实现、检查、实际验收和反馈修订之间的交接，不证明无需人工介入，也不证明比其他工具更快。

## Inspect and reproduce

- [Original request and CSV inputs](README.md)
- [Model-produced patch](accepted-result/repair.patch), limited to five application/test files and three model-authored specification files
- [Original model delivery report](accepted-result/delivery.md), [plan](accepted-result/implementation-plan.md), [Recall](accepted-result/Recall.md)
- [File hashes and source identity](accepted-result/manifest.json), [upstream license](accepted-result/UPSTREAM-LICENSE)

Use an untouched checkout of Actual revision `12f4b6e22dd54e0a66324271235454f450cbbf99`. Inspect the patch, then run `git apply --check` and `git apply` with its local absolute path. The check passed against files extracted from the original pinned source archive. Follow the prepared environment commands in the input brief, run the focused commands in the delivery report, rebuild core, and repeat both original page paths in fresh accounts. Previous failed imports can change matching metadata, so do not reuse those accounts as a fresh baseline.

## Evidence and actual interventions

| Stage | Observed result |
| --- | --- |
| Task/model | `tsk_g00VUmZqP600uM3c6JmE`; real streamed messages identify `openai/gpt-5.6-luna`; final Task status `completed` |
| First implementation | Preserved the transient force-add marker through normalization; focused backend checks passed |
| First operator acceptance | Failed: fresh account `Luna acceptance manual 0347` still had only Netflix and -8.99 |
| Feedback and repair | Operator supplied the exact failed page sequence; same Task added selection conversion for ordinary new rows before final import |
| Final operator acceptance | Fresh accounts `Luna final manual 0419` and `Luna final imported 0419` each showed both original dates/notes, two rows and -17.98 after the explicit core development build |
| Independent review | Separate read-only Luna reviewer found no blocking code defect; reran 28 synchronization and 111 pure utility tests successfully |
| Evidence correction | Reviewer identified inconsistent fixture-date prose; same Task corrected the imported fixture and records, then reviewer reran 28 synchronization tests and confirmed the issue resolved |

The original model delivery report ends with independent review unresolved because it was written before the separate review receipt. This wrapper records the subsequent **PASS**, without rewriting the original artifact. Actual screenshots and readbacks were inspected in the operating task; this package does not include a recorded video or screenshot archive. The 10 parser tests and core typecheck are model-reported results; the separate reviewer reran synchronization and pure utility tests. No UI automated tests were used.

## Boundaries that matter

- The source project and initial reproduction environment were prepared by the operator. The operator rebuilt core and performed page acceptance. First-attempt failure and these interventions are part of the result.
- The runtime/model created local Git checkpoints and commits despite a no-commit instruction. This is an instruction-compliance limitation, not perfect autonomous execution. No upstream contribution or remote publication of the Actual repository is claimed; history was not rewritten to hide this.
- Desktop-client typecheck had pre-existing errors; full-project typecheck is not claimed green. An unrelated `gradlew.bat` change was excluded.
- The upstream issue and existing WIP patch were already public. No proposed upstream patch was supplied as a solution; this is not our discovery. Actual Budget is not a customer or endorsement.
- No measured human-time baseline, cost comparison or competitor experiment exists. Do not claim time savings, superiority or a general success rate.
- This maintainer run contributes **zero** to the goal of five independent testers, three accepted first uses and two different-task repeat uses.

The website's illustrated promotional video remains a separate product explanation, not a recording of this run. This package is inspectable case evidence; a case video and updated public campaign remain separate work.
