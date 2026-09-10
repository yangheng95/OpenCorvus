# Real import case: channel copy

Status: prepared copy only, 10 September 2026. Neither post below has been
submitted. These drafts replace the withdrawn Parcel Notes campaign as candidate
copy; they do not establish account access, publication approval or adoption.
The separate [issue #30 invitation](https://github.com/yangheng95/opencorvus/issues/30)
was updated and read back on 10 September 2026; neither social draft was submitted.

The [accepted result](RESULT.md) is the factual source. Public links below pin
its existing evidence commit, so a future edit cannot silently change what a
reader was invited to inspect. No new model execution or page acceptance was
performed to write these posts.

## LinkedIn — English

The backend checks passed. The transaction still disappeared.

In a pinned Actual Budget source snapshot, the import preview showed a coffee
purchase as new. After skipping a duplicate and importing, the account still
contained only the original transaction.

We used OpenCorvus with gpt-5.6-luna to work through the repair. The first patch
passed focused backend checks, then failed when the actual page flow was repeated.
That failed sequence went back to the same Task. The next repair connected
the preview selection to the final import. Fresh manual-entry and CSV-import
baseline accounts then both retained the new purchase.

A separate read-only Luna reviewer reran the synchronization and pure utility
checks and also caught inconsistent fixture-date documentation, which was corrected.

The operator prepared the source environment and performed page acceptance. This is a
maintainer demonstration: no unattended-success claim, customer endorsement or
upstream contribution. The patch, failed attempt and interventions are available:

[Inspect the repair and evidence](https://github.com/yangheng95/opencorvus/blob/9482c811/specs/artifacts/2026-09-10-import-case/RESULT.md).

Do you have a scoped project change with a clear before/after check? Try it with
OpenCorvus and share the accepted result or the step that blocked you in our
[voluntary pilot](https://github.com/yangheng95/opencorvus/issues/30). Public-safe
details only; installation guidance is linked there.

## 小红书 — 中文

标题：测试过了，导入的那行却没了

这次让 OpenCorvus 处理的，是一个真实开源项目里已经有人报告的问题。

在固定版本的 Actual Budget 源码中，导入预览把一笔咖啡消费显示为“新增”。
跳过重复记录、点击导入，账户里却还是只有原来的那笔。

第一版修复通过了后端检查，真实页面复测时，咖啡记录依然没有进来。
把这段失败步骤发回同一个任务后，gpt-5.6-luna 继续修正了“预览选择 → 最终提交”这段转换。
再用两个全新账户验收：一个先手动记账，一个先从 CSV 导入，两条路径都保留了新增消费。

之后，另一位只读 Luna 审查 agent 复跑了同步和纯工具函数检查，还发现样例日期说明不一致，随后也做了修正。

这个过程里，操作者负责准备环境和页面验收。补丁、第一版失败、反馈后的修订和人工介入都有记录。
这是维护者演示，没有宣称全程无人参与，也没有向 Actual 上游提交补丁。

项目：GitHub 上的 yangheng95/opencorvus。
[查看完整案例和补丁](https://github.com/yangheng95/opencorvus/blob/9482c811/specs/artifacts/2026-09-10-import-case/RESULT.md)。

如果你也有一项能明确核对前后结果的项目任务，欢迎试用后在仓库的 issue #30 留下结果或具体卡点。
只分享适合公开的信息，私有代码和密钥请留在本地。

## Claim and publication notes

- The English post uses the project's maintainer voice. Confirm the destination
  account before using it; the operator steps are not a customer testimonial.
- Reproduction, first failed acceptance, final two-account acceptance and the
  independent review each map to the corresponding row in RESULT.md. The
  original delivery report alone predates the independent review receipt.
- This package has no recording or screenshot archive. Do not attach the
  illustrated website video or withdrawn sample cards as footage of this run.
- No time or cost comparison was measured. Engagement, publication and an
  accepted independent task are separate observations; these drafts add zero
  to the five-testers / three-first-results / two-repeat-uses targets.
- After actual authorized submission, retain the destination URL, exact posted
  wording and readback time in the operating ledger. Until then keep this status
  as prepared, even if the file has been committed and pushed.
