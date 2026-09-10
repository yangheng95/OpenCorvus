# First-result communication cards

Prepared media and withdrawn posts for the Parcel Notes onboarding exercise.
These cards show expected outputs, not an application screenshot or model-run evidence.

**Campaign status — withdrawn, 10 September 2026:** the user rejected this example as too simple to demonstrate product value. Do not publish the cards or drafts below as the LinkedIn/Xiaohongshu campaign. Retain the sample for onboarding diagnostics and the original Task files as narrow evidence. Neither social post was submitted; Xiaohongshu received an editor preview only. New campaign positioning and evidence requirements are in the operating ledger's Product marketing v1 section.

## Inspect the actual result / 查看真实交付

Before setting up a model, inspect what one completed trial produced:

- [The model's project explanation](accepted-result/docs/first-result.md), copied without rewriting.
- [Final program](accepted-result/src/index.js) and [existing test updated by the task](accepted-result/test/output.test.js).
- [Original three-file input](../../../examples/parcel-notes) and [the prompts you can try](../../../examples/README.md).

The requested change was `375` → `425` grams. The program's weights became
`[125, 250, 425]`, the test expectation became `800 g`, and the explanation cites
the changed source. `package.json` retained its original bytes. These are the
retained files from Task `tsk_g00VUijyPO005z4tnMo5`, run with
`openai/gpt-5.6-luna` in a Windows source environment; the
[maintainer record](../../records/2026-09/2026-09-08-founder-operations.md)
documents the accepted first request and same-task follow-up.

To check this delivered project yourself, download or clone this repository,
then run from its root with Node.js 22+ (no model or package install required):

```sh
node specs/artifacts/2026-09-09-first-result-media/accepted-result/src/index.js
node --test specs/artifacts/2026-09-09-first-result-media/accepted-result/test/output.test.js
```

The copied files were rerun on 10 September 2026: `800 g`, **1 test passed**.
This command replay is new verification of retained files, not a new model run.
The original task needed tool-input corrections. This small onboarding example
does not demonstrate business-project performance, released-installer acceptance,
independent user success, elapsed time or cost savings.

**中文：** 配置模型之前，可以先打开上方的原始生成说明、最终源码和测试，看看交付物到底是什么。
任务把第三个重量从 `375` 改为 `425`，程序和既有测试同步得到 `800 g`，说明引用了对应源码，
`package.json` 的字节保持不变。四个文件直接复制自上述真实 Luna 任务，没有重写成更漂亮的答案。
在仓库根目录执行上面两条命令即可自行核对，不需要模型或安装依赖，只需 Node.js 22+。
本次重跑得到 `800 g`、1 项测试通过；这是旧产物的新核验，不是一次新的模型执行。
首次任务曾发生工具输入纠正；小样例不代表业务项目效果、安装包或独立用户已验收通过，也不证明耗时或费用优势。

[Try it and share a concrete result or blocker / 亲自试用并反馈](https://github.com/yangheng95/opencorvus/issues/30).

## Assets

- [English PNG](first-result-en.png) and [editable SVG](first-result-en.svg).
- [Chinese PNG](first-result-zh.png) and [editable SVG](first-result-zh.svg).
- [Builder](build.mjs), the single source for text and layout.

Both images are 1600 × 900 pixels. Use each image with its matching draft below;
the post supplies the exact source link and prerequisites. Neither social-post
draft has been posted. The separate GitHub pilot is published as
[issue #30](https://github.com/yangheng95/opencorvus/issues/30), with its initial
publication text retained below.

## Source and limits

The exercise is pinned to source commit
`c6b429b8e1ac70d0d5539658c0f44605a9510f2a`:
[bilingual guide and sample](https://github.com/yangheng95/opencorvus/tree/c6b429b8e1ac70d0d5539658c0f44605a9510f2a/examples).
The local source was inspected and executed in the operating work; this cut does
not claim fresh external retrieval of that link.

The original program adds 125, 250 and 375 grams and outputs `750 g`. The follow-up
changes the third input to 425 grams, so the expected output becomes `800 g`.
The local command/test and a manually changed temporary copy were verified in the
[operating record](../../records/2026-09/2026-09-08-founder-operations.md).
Those checks establish the example's arithmetic and process contract. They do
not establish an accepted OpenCorvus model result, general model quality, a
benchmark score or participant adoption.

The brand mark is the existing [public favicon](../../../packages/web/public/favicon.svg),
embedded unchanged. Layout and copy are original project work. The SVGs reference
Segoe UI, Microsoft YaHei and a generic sans-serif font; no font files are embedded
or redistributed. Font availability can change a rebuild's appearance. Use the
visually reviewed PNGs for the prepared posts.

## Withdrawn LinkedIn draft — do not publish

We’re building OpenCorvus, an open-source agent workbench, and looking for five independent developers to try one small coding task.

The workflow we want to make useful: understand an existing project, make a scoped change, and inspect the files and test results yourself.

For a small first exercise, we provide a three-file project:

1. Ask for a project explanation with exact source references.
2. Change one input and update the existing test.
3. Check that the code, test and explanation agree: 750 g before, 800 g after.

One maintainer Luna Task produced inspectable files, which we have published. That run needed tool-input corrections. This is early onboarding evidence, not a benchmark or proof that every installation or model will succeed.

You’ll need Node.js 22+ for the sample, OpenCorvus and a configured model for agent work. Model charges depend on your provider; a setup blocker is useful feedback too.

Start with the [pilot instructions and actual result](https://github.com/yangheng95/opencorvus/issues/30).
Tell us what you tried and which check passed, needed correction or blocked you. Please keep credentials and private code out of public replies.

#OpenSource #DeveloperTools #AIAgents

**Image:** `first-result-en.png`

**Alt text:** OpenCorvus first-result exercise. Explain source with parcel weights
125, 250 and 375 grams, expected total 750 grams. Change the third weight to 425,
expected total 800 grams. Verify the code, test and explanation.

## 已撤回的小红书草稿 — 禁止发布

**标题：** 做了个开源 Agent，找5人试用

**正文：**

我们在做 OpenCorvus，一个开源 Agent 工作台。

想解决的具体问题：接手一个项目时，先读懂代码，再完成一项小改动，最后能亲自核对交付。

这轮想找 5 位独立开发者，试一次最小流程：

① 让 Agent 阅读三文件样例，写一份带源码路径的说明。
② 修改一个输入，同时更新原有测试。
③ 自己打开源码、测试和说明，检查三者是否一致。

样例修改前应输出 750 g，修改后应输出 800 g。配图展示的是这个练习的预期结果。

我们已经公开过一次维护者 Luna Task 的原始交付，过程中也发生过工具输入纠正。它只是小样例记录，还不能代表真实业务项目、不同安装环境或所有模型的效果。

样例需要 Node.js 22+；执行 Agent 工作还需要安装 OpenCorvus、配置可用模型，模型费用由所选服务决定。

GitHub 搜索「yangheng95/opencorvus」，进入 Issues #30，就能看到试用步骤和原始交付。试完可以直接说：做了什么、结果是否可接受、卡在哪一步。安装或模型配置卡住也欢迎反馈，请勿公开密钥和私有代码。

#开源项目 #独立开发者 #AI编程 #开发工具

**编辑备注（不发布）：** 试用入口为 https://github.com/yangheng95/opencorvus/issues/30 。发布时仅复制标题和正文，不复制本备注、配图路径或替代文字。根据实际编辑器填写话题，不承诺链接或话题必然可点击。

**配图：** `first-result-zh.png`

**替代文字：** OpenCorvus 首次交付练习。解释输入为 125、250、375 克的源码，预期
总重为 750 克；将第三个重量改成 425 克，预期总重为 800 克；核对代码、测试与说明。

## Published GitHub pilot issue

Destination: `yangheng95/opencorvus` GitHub issue tracker.
Posting account: `yangheng95`.
Published as [issue #30](https://github.com/yangheng95/opencorvus/issues/30) after
the user's authorization for non-payment operations. The title and body were
read back and checked against the initial text below. The live issue is the
public invitation; use that issue for current progress and voluntary feedback.
Scope: one text-only issue with the exact title and body below; no labels,
assignments, comments on other issues, direct messages or attached uploads.
The issue seeks early validation, not endorsement
of a completed onboarding path. The two social-post drafts above remain separate
and unsent.

**Title:** `[Pilot] Help validate the first task / 首次任务试用`

**Body begins**

We are looking for up to five volunteers who are comfortable running a small
Node.js project and already have, or independently choose to set up, OpenCorvus
with an available model. The first-task path is still being validated. A blocked
attempt is useful feedback; we are not assuming it will work on every setup.

Use the [pinned Parcel Notes guide and three-file sample](https://github.com/yangheng95/opencorvus/tree/c6b429b8e1ac70d0d5539658c0f44605a9510f2a/examples).
Copy the sample into a disposable directory. First run its program and test with
Node.js 22 or newer: the expected total is `750 g`. Then follow the guide to ask
OpenCorvus for a source-backed explanation, inspect the resulting file, and—if
that first result is acceptable—continue the same task with the prescribed
weight change. The follow-up's expected total is `800 g`.

These numbers are sample expectations, not observed model results. A completed
task status alone does not count as acceptance. Published builds and source
checkouts may differ, so please record the exact version you used. Model access
and any provider charges are your choice; no paid run is required to report a
setup blocker.

If you choose to share, leave a short report in this issue:

- OpenCorvus version, operating system, and provider/model identifier.
- First task: accepted, needs correction, blocked, or not attempted; name the
  guide's check that determined the result.
- Same-task follow-up: accepted, needs correction, blocked, or not attempted.
- Elapsed time and provider-reported cost if measured; otherwise write unknown.
- A minimal reproduction or redacted error for any blocker.

Participation and reporting are optional. Reports here are public: omit keys,
login codes, private paths and private project content. This exercise collects
no telemetry and makes no benchmark or model-success-rate claim.

中文：我们希望邀请最多五位熟悉基本命令行操作的志愿者，验证一次可以亲自核对的
首次任务。这个流程仍在验证中，遇到阻塞也是有效反馈，不要求得到预设的成功结果。

请使用上面的固定版本双语指南，把三个样例文件复制到临时目录。用 Node.js 22 或
更新版本运行程序和测试，预期为 `750 g`；再按指南请求 OpenCorvus 生成有源码引用的
说明，检查实际文件。首次结果可接受后，在同一任务里完成指南规定的修改，预期为
`800 g`。这些是样例预期，不是模型已成功运行的证据。

如愿意分享，请在此 issue 留下版本、系统和模型标识，首次请求与同一任务续作各自的结果及具体
核对依据，以及已测量的耗时、费用或脱敏阻塞信息；未测量就写“未知”。已发布版本
与源码可能不同，请记录准确版本。是否配置模型和承担 Provider 费用由你决定，报告
配置阻塞无需付费运行。参与和反馈完全自愿，内容会公开，请勿粘贴密钥、登录码、
私人路径或私人项目内容。样例没有遥测，也不用于宣称基准成绩或模型成功率。

**Body ends**

## Rebuild

With Node.js and an existing Sharp installation, pass its absolute module path:

```text
node specs/artifacts/2026-09-09-first-result-media/build.mjs <absolute-path-to-sharp-module>
```

The builder writes both SVGs and PNGs beside itself and reads the existing favicon.
Review both rendered images after changing text, fonts, layout or the mark.
The prepared exports were rendered on Windows with the bundled Sharp dependency;
there is no application UI automation or screenshot comparison in this package.

## Revised pilot invitation — adoption cycle, 10 September 2026

This is the published replacement for issue #30. The initial publication
above is historical. The existing cards remain sample illustrations, not a new
real-project demo. Independent review passed before publication; the live issue
body was read back and matched this copy. Publication is recorded in the founder
operating ledger.

<!-- pilot-current-start -->
## Start with a result you can inspect

OpenCorvus carried a reported import-preview bug in a pinned Actual Budget source snapshot from reproduction through a source patch, page acceptance, and independent review. [Inspect the case result](https://github.com/yangheng95/opencorvus/blob/main/specs/artifacts/2026-09-10-import-case/RESULT.md) before setting up a model. It shows the before/after, actual interventions, source patch and review boundaries. This is one maintainer demonstration, not a customer endorsement or an upstream contribution.

We are looking for **five early testers** who want to try a small, public-safe task in a project they care about and leave files and tests they can inspect.

[The Parcel Notes three-file exercise](https://github.com/yangheng95/opencorvus/tree/c6b429b8e1ac70d0d5539658c0f44605a9510f2a/examples#english) remains available as an optional setup walkthrough. It needs Node.js 22+ and the expected sample output changes from `750 g` to `800 g` after the follow-up.

1. [Set up OpenCorvus and a model](https://opencorvus.com/start/quickstart/).
2. Try a bounded task in your own project, or use the optional Parcel Notes walkthrough if you only want to validate setup.
3. Reply here with **your version, OS, model, task type, and where you got to**: setup blocked / first result accepted / needs correction. One concrete blocker or useful result is enough. If you later use OpenCorvus for a different task, tell us what you used it for.

Already have an appropriate project? You can instead describe a small, non-sensitive task you want to try. Share only public-safe details. Model access and any provider charges are your choice.

**What is verified:** one maintainer run using `openai/gpt-5.6-luna` in an isolated Windows source environment completed the Actual Budget repair after a failed first attempt and explicit feedback, with page states, files, commands and independent review checked. This does not establish released-installer acceptance or independent user success. [Evidence and limits](https://github.com/yangheng95/opencorvus/blob/main/specs/artifacts/2026-09-10-import-case/RESULT.md).

## 先看真实结果，再试一次实际交付

OpenCorvus 在固定版本的 Actual Budget 源码快照中，把一个已报告的导入预览问题从复现推进到源码修复、页面验收和独立复审。请先[查看案例结果](https://github.com/yangheng95/opencorvus/blob/main/specs/artifacts/2026-09-10-import-case/RESULT.md)，了解前后差异、实际介入、源码补丁和复审边界。这是一次维护者演示，不是客户背书，也不是向上游提交的补丁。

寻找 **五位早期试用者**：在自己关心的项目中试一项小而适合公开的任务，让 OpenCorvus 读懂项目、完成一处修改，再亲自核对文件和测试。

1. [安装 OpenCorvus 并配置模型](https://opencorvus.com/zh-cn/start/quickstart/)。
2. 试一项范围明确、适合公开的项目任务；如果只想验证设置，可选用[三文件 Parcel Notes 指南](https://github.com/yangheng95/opencorvus/tree/c6b429b8e1ac70d0d5539658c0f44605a9510f2a/examples#中文)，其预期输出从 `750 g` 变为 `800 g`。
3. 在此回复 **版本、系统、模型、任务类型，以及做到哪一步**：配置卡住 / 首次交付可接受 / 需要修正。一个具体卡点或有用结果就够了。之后若用它完成另一项任务，也欢迎告诉我们用途。

也可以提出你自己项目中一项小而明确的任务，只分享适合公开的信息；不要贴密钥、私人路径或私有代码。模型访问及可能产生的费用由你选择。

目前已有一次维护者在 Windows 隔离源码环境中使用 `openai/gpt-5.6-luna` 完成 Actual Budget 案例的实现、失败反馈后的修订和页面验收，并核对了文件、命令输出和独立复审。这不代表发布安装包或独立用户已经验收通过，详见上方案例链接。欢迎真实反馈，成功和卡住都值得记录。
<!-- pilot-current-end -->
