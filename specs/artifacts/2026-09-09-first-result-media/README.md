# First-result communication cards

Prepared media and unsent posts for the Parcel Notes onboarding exercise.
These cards show expected outputs, not an application screenshot or model-run evidence.

## Assets

- [English PNG](first-result-en.png) and [editable SVG](first-result-en.svg).
- [Chinese PNG](first-result-zh.png) and [editable SVG](first-result-zh.svg).
- [Builder](build.mjs), the single source for text and layout.

Both images are 1600 × 900 pixels. Use each image with its matching draft below;
the post supplies the exact source link and prerequisites. No channel or account
has been selected, and neither draft has been posted.

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
If you try it, optional feedback through the guide's support link is welcome:
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
如愿意反馈，可通过指南中的支持入口告诉我们：哪项核对通过了、需要修改，或遇到了什么
阻塞？只分享适合公开的信息。

**配图：** `first-result-zh.png`

**替代文字：** OpenCorvus 首次交付练习。解释输入为 125、250、375 克的源码，预期
总重为 750 克；将第三个重量改成 425 克，预期总重为 800 克；核对代码、测试与说明。

## Rebuild

With Node.js and an existing Sharp installation, pass its absolute module path:

```text
node specs/artifacts/2026-09-09-first-result-media/build.mjs <absolute-path-to-sharp-module>
```

The builder writes both SVGs and PNGs beside itself and reads the existing favicon.
Review both rendered images after changing text, fonts, layout or the mark.
The prepared exports were rendered on Windows with the bundled Sharp dependency;
there is no application UI automation or screenshot comparison in this package.
