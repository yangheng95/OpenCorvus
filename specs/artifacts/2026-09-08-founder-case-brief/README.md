# OpenCorvus case brief — 2026-09-08

An original two-page English/Chinese brief for technical readers evaluating inspectable multi-stage agent work. This is prepared material, not a published campaign or a fresh reproduction.

- `opencorvus-case-brief-en-zh.pdf`: final brief with clickable pinned sources.
- `case-facts.json`: derived facts, six confusion matrices and pinned source URLs. `decodedUtf8Sha256` hashes decoded UTF-8 response content, not Git blob bytes.
- `build.py`: original ReportLab builder; verifies all six matrix counts and macro-F1 calculations before rendering.
- [Operating ledger](../../records/2026-09/2026-09-08-founder-operations.md): scope, validation and remaining adoption work.

## Evidence audit

Source snapshot: [public case repository at ee54b400efac](https://github.com/yangheng95/deberta-v3-absa-public-evidence/tree/ee54b400efac03ed665d86c45653dc4239b4c285). The current OpenCorvus website links this case. The brief describes what its public artifacts contain; it does not independently establish agent autonomy, runtime model identity or complete execution provenance.

Rechecked here: six macro-F1 values from published confusion matrices; validation counts of 700 and test counts of 1,336; smoothing has the highest reported validation value. Selected validation macro-F1 rounds to 0.8343; its test macro-F1 rounds to 0.8361. Training size 1,800, seed 42 and one epoch are reported protocol facts, not newly executed experiments. Configurations also change learning rate; these are not causal ablations or a model ranking.

Source-reported only: validation-before-test selection chronology, CUDA execution and the six-stage collaboration record. Full original training console logs are unrecoverable. We did not download weights, datasets or raw prediction files. Arithmetic agreement does not prove those external assets or reproduce training.

The public process index's Stage 4 target `reports/task4/evidence-analysis/process-index.json` is absent from the pinned tree; Stage 4 is marked superseded by Stage 5. Stage 6 retains a prepublication status, although the pinned Git commit is publicly accessible. These are unresolved source navigation/provenance limitations. We did not edit the separate evidence repository. The older August 9 CPU case and a 12h45 video claim are not used in this brief.

The source reserves rights to its authored code/documents. This package contains original commentary, original chart/layout code and derived numerical facts; it links to source materials without copying their paper, figures or media. Public readability is not redistribution permission. No venue acceptance is claimed for the case paper.

## Build and inspect

Use Python with `reportlab` installed and a locally available CJK TrueType font:

```powershell
python specs/artifacts/2026-09-08-founder-case-brief/build.py --cjk-font C:/Windows/Fonts/msyh.ttc
```

The Windows default uses Microsoft YaHei, installed locally; the font file is not distributed in this folder. Another environment must supply its own compatible font path. Render the PDF with Poppler, then visually inspect both pages after each layout edit. The builder's numeric assertions do not replace visual review. The PDF is not a UI test or screenshot baseline.

## Proposed community copy — not sent

English:

> What should remain after a long agent task? We are building OpenCorvus around inspectable deliverables. This two-page case note follows a public DeBERTa sentiment-analysis record through experiments, figures and a paper, and links every numerical claim to a fixed source snapshot. It also keeps the gaps visible: one seed, one domain, missing original full logs and external raw assets. We would welcome technical feedback on whether this evidence is useful for reviewing multi-stage work, and what you would need to trust the next case.

中文：

> 一个长程 Agent 任务结束后，应该留下什么？OpenCorvus 希望留下可以检查的交付。这份双语简报沿着一个公开的 DeBERTa 情感分析案例，查看实验、图表和论文，并把数值链接到固定版本的原始记录。我们也保留了它的限制：单一种子、单一领域、原始完整日志缺失，以及未随仓库公开的原始资产。欢迎从技术角度反馈：这样的证据是否有助于审阅多阶段工作？下一个案例还需要补齐什么？

Attach the brief and link the pinned source above plus [OpenCorvus](https://github.com/yangheng95/opencorvus). Before external posting, select the exact community/account, check its current rules and obtain authorization for that concrete destination and text. No outreach has been sent. This package alone does not satisfy real first-use acceptance, adoption measurement or independent reproduction.
