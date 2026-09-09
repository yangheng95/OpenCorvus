# First-result communication cards

Prepared media and unsent posts for the Parcel Notes onboarding exercise.
These cards show expected outputs, not an application screenshot or model-run evidence.

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

## English draft — not sent

Trying an agent workbench? Start with a result you can check yourself.

We added Parcel Notes to OpenCorvus: a three-file source project, a request to
explain it with source references, and a follow-up in the same task to change one
input. Then inspect whether the code, test and explanation agree.

The expected totals are 750 g before the change and 800 g after it. This is an
onboarding exercise, not a benchmark or a claim about a model's success rate.
Running the sample needs Node.js 22+; running agent tasks also needs OpenCorvus
and a configured model, whose costs depend on your provider.

[Try the pinned sample and bilingual guide](https://github.com/yangheng95/opencorvus/tree/c6b429b8e1ac70d0d5539658c0f44605a9510f2a/examples).
If you try it, optional feedback in the [first-task pilot issue](https://github.com/yangheng95/opencorvus/issues/30) is welcome:
which check passed, needed correction or was blocked? Share only information you
are comfortable making public.

**Image:** `first-result-en.png`

**Alt text:** OpenCorvus first-result exercise. Explain source with parcel weights
125, 250 and 375 grams, expected total 750 grams. Change the third weight to 425,
expected total 800 grams. Verify the code, test and explanation.

## 中文文案 — 未发送

体验 Agent 工作台，可以先从一份自己能核对的交付开始。

我们为 OpenCorvus 加入了 Parcel Notes：一个只有三个文件的小项目，先请求模型
解释代码并引用来源，再在同一任务中修改一个输入，最后检查代码、测试和说明是否一致。

修改前的预期总重是 750 克，修改后是 800 克。这是首次使用练习，不是基准测试，
也不代表模型成功率。运行样例需要 Node.js 22 或更新版本；执行 Agent 任务还需要
OpenCorvus 和已配置的模型，费用取决于你的 Provider。

[查看固定版本的样例与双语指南](https://github.com/yangheng95/opencorvus/tree/c6b429b8e1ac70d0d5539658c0f44605a9510f2a/examples)。
如愿意反馈，可在[首次任务试用 issue](https://github.com/yangheng95/opencorvus/issues/30) 告诉我们：哪项核对通过了、需要修改，或遇到了什么
阻塞？只分享适合公开的信息。

**配图：** `first-result-zh.png`

**替代文字：** OpenCorvus 首次交付练习。解释输入为 125、250、375 克的源码，预期
总重为 750 克；将第三个重量改成 425 克，预期总重为 800 克；核对代码、测试与说明。

## Published GitHub pilot issue

Destination: `yangheng95/opencorvus` GitHub issue tracker.
Posting account: `yangheng95`.
Published as [issue #30](https://github.com/yangheng95/opencorvus/issues/30) after
the user's authorization for non-payment operations. The title and body were
read back and checked against the initial text below. The live issue now also
contains subsequent maintainer acceptance and website updates; use that issue
for current progress and voluntary feedback.
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
