"""Build the original bilingual case brief from the pinned, derived fact ledger.

Requires reportlab. Pass --cjk-font for a TrueType Chinese font on other hosts.
This builder never fetches assets, runs models, or changes the source case.
"""

import argparse
import json
from fractions import Fraction
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parent
INK = colors.HexColor("#162F39")
MUTED = colors.HexColor("#48636B")
ACCENT = colors.HexColor("#D65234")
PAPER = colors.HexColor("#FAF8F2")
RULE = colors.HexColor("#D6DDD8")
W, H = 595.28, 841.89


def verify_facts(facts):
    for run in facts["runs"]:
        for split in ("validation", "test"):
            data = run[split]
            matrix = data["confusionMatrix"]
            count = sum(sum(row.values()) for row in matrix.values())
            f1 = sum(
                Fraction(
                    2 * matrix[str(i)][str(i)],
                    sum(matrix[str(i)].values())
                    + sum(matrix[str(j)][str(i)] for j in range(3)),
                )
                for i in range(3)
            ) / 3
            assert count == data["count"]
            assert abs(float(f1) - data["macroF1"]) < 1e-14
    winner = max(facts["runs"], key=lambda run: run["validation"]["macroF1"])
    assert winner["runId"] == facts["selectedRun"]
    return winner


def paragraph(c, text, x, top, width, font, size=10, leading=15, color=INK, max_height=100):
    style = ParagraphStyle(
        "brief", fontName=font, fontSize=size, leading=leading,
        textColor=color, alignment=TA_LEFT, wordWrap="CJK" if font == "CN" else None,
    )
    p = Paragraph(text, style)
    _, height = p.wrap(width, max_height)
    if height > max_height:
        raise ValueError(f"Text exceeds its layout box: {height} > {max_height}: {text[:60]}")
    p.drawOn(c, x, top - height)
    return top - height


def page(c, facts, selected, chinese=False):
    font = "CN" if chinese else "Helvetica"
    bold = font if chinese else "Helvetica-Bold"
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(ACCENT)
    c.rect(38, 785, 24, 4, fill=1, stroke=0)
    paragraph(c, "OPENCORVUS / CASE NOTES 01", 72, 792, 380, "Helvetica-Bold", 9, 12)
    title = "长程任务，留下什么？" if chinese else "What does long work\nleave behind?"
    paragraph(c, title.replace("\n", "<br/>"), 38, 754, 520, bold, 28, 33, max_height=72)
    deck = (
        "一个 DeBERTa 情感分析案例，把数据、实验、图表、论文和公开记录串在一起。"
        "OpenCorvus 主张：让多阶段工作留下可以检查的交付。"
        if chinese else
        "A DeBERTa sentiment-analysis case connects data, experiments, figures, a paper and a public record. "
        "The OpenCorvus proposition: multi-stage work should leave inspectable deliverables."
    )
    paragraph(c, deck, 38, 674, 520, font, 11, 16, max_height=51)
    paragraph(c, "公开过程索引中的六个阶段" if chinese else "SIX STAGES IN THE PUBLIC PROCESS INDEX", 38, 605, 520, bold, 10, 14)
    stages = (
        ["模型与数据", "CUDA 实验与网页", "架构与实验图表", "文献与论文初稿", "独立审阅与定稿", "公开审计与发布记录"]
        if chinese else
        ["Model + data", "CUDA experiments + web", "Architecture + figures", "Literature + paper draft", "Review + final paper", "Publication audit record"]
    )
    for i, stage in enumerate(stages):
        x = 38 + (i % 2) * 269
        top = 579 - (i // 2) * 29
        paragraph(c, f"0{i+1}", x, top, 27, "Helvetica-Bold", 11, 14, ACCENT)
        paragraph(c, stage, x + 31, top, 222, font, 10, 14, max_height=24)
    c.setStrokeColor(RULE)
    c.line(38, 493, 557, 493)
    paragraph(c, "验证集 macro-F1 / 三个固定运行" if chinese else "VALIDATION MACRO-F1 / THREE FIXED RUNS", 38, 474, 520, bold, 10, 14)
    labels = {
        "baseline-seed42": "基线" if chinese else "Baseline",
        "innovation-smoothing-seed42": "标签平滑（选中）" if chinese else "Smoothing (selected)",
        "innovation-freeze-embeddings-seed42": "冻结词嵌入" if chinese else "Frozen embeddings",
    }
    for i, run in enumerate(facts["runs"]):
        top = 446 - i * 28
        score = run["validation"]["macroF1"]
        paragraph(c, labels[run["runId"]], 38, top + 1, 168, font, 10, 13)
        c.setFillColor(RULE)
        c.rect(212, top - 10, 268, 10, fill=1, stroke=0)
        c.setFillColor(ACCENT if run["runId"] == facts["selectedRun"] else MUTED)
        c.rect(212, top - 10, 268 * score, 10, fill=1, stroke=0)
        paragraph(c, f"{score:.4f}", 497, top + 1, 60, "Helvetica-Bold", 11, 13)
    paragraph(c, "0", 212, 372, 30, "Helvetica", 8, 10, MUTED)
    paragraph(c, "1", 476, 372, 20, "Helvetica", 8, 10, MUTED)
    protocol = facts["protocol"]
    note = (
        f"每次训练 {protocol['trainCount']:,} 条，验证 {protocol['validationCount']:,} 条；seed 42，1 epoch。"
        f"按验证集选择后，选中运行的测试 macro-F1 为 {selected['test']['macroF1']:.4f}（{protocol['testCount']:,} 条）。"
        "macro-F1 为各类别 F1 的平均值；此处按公开混淆矩阵复算。"
        if chinese else
        f"{protocol['trainCount']:,} training / {protocol['validationCount']:,} validation examples; seed 42, one epoch. "
        f"After validation selection, the selected run reports test macro-F1 {selected['test']['macroF1']:.4f} "
        f"on {protocol['testCount']:,} examples. Macro-F1 averages class F1 scores; arithmetic rechecked from public confusion matrices."
    )
    paragraph(c, note, 38, 343, 520, font, 9, 13, MUTED, max_height=55)
    c.setFillColor(INK)
    c.roundRect(38, 166, 519, 108, 6, fill=1, stroke=0)
    paragraph(c, "证据边界，也是案例的一部分" if chinese else "THE LIMITATIONS TRAVEL WITH THE RESULT", 52, 258, 491, bold, 10, 14, colors.white)
    limits = (
        "单一种子、单一餐饮领域；不同配置也改变了学习率，不能推导因果优势或模型排名。"
        "完整原始训练日志不可恢复，权重与原始预测文件不在公开仓库中。"
        "本简报复核公开摘要，未重跑训练，也未独立确认完整运行过程。"
        if chinese else
        "One seed and one restaurant domain. Configurations also differ in learning rate; this is not a causal ablation or a model ranking. "
        "Original full training logs are unrecoverable; weights and raw predictions are external. "
        "This brief checks public summaries, not a fresh training run or the full execution history."
    )
    paragraph(c, limits, 52, 235, 491, font, 9, 13, colors.white, max_height=65)
    repo = facts["repository"]
    commit = facts["revision"]
    base = f"{repo}/blob/{commit}/"
    source_text = (
        '查看原始记录：<link href="' + base + 'reports/task2/experiments/comparison.json" color="#D65234">实验对照</link> · '
        '<link href="' + base + 'reports/task4/evidence-analysis/canonical-metrics.json" color="#D65234">指标与矩阵</link> · '
        '<link href="' + base + 'docs/process/public-process-index.json" color="#D65234">过程索引</link> · '
        '<link href="' + base + 'docs/limitations-and-licensing.md" color="#D65234">限制与权利</link>'
        if chinese else
        'Inspect the sources: <link href="' + base + 'reports/task2/experiments/comparison.json" color="#D65234">experiments</link> / '
        '<link href="' + base + 'reports/task4/evidence-analysis/canonical-metrics.json" color="#D65234">metrics + matrices</link> / '
        '<link href="' + base + 'docs/process/public-process-index.json" color="#D65234">process index</link> / '
        '<link href="' + base + 'docs/limitations-and-licensing.md" color="#D65234">limitations + rights</link>'
    )
    paragraph(c, source_text, 38, 145, 520, font, 9, 13, max_height=30)
    paragraph(c, "公开材料可阅读，不代表案例代码、文档或模型获得再分发许可。" if chinese else "Public access does not grant redistribution rights to the case code, documents or models.", 38, 113, 520, font, 8, 12, MUTED, max_height=26)
    paragraph(c, '<link href="https://github.com/yangheng95/opencorvus" color="#162F39">github.com/yangheng95/opencorvus</link>', 38, 76, 520, "Helvetica-Bold", 10, 13)
    footer = f"SOURCE {commit[:12]}  /  REVIEWED {facts['checkedOn']}  /  " + ("ZH 02" if chinese else "EN 01")
    paragraph(c, footer, 38, 39, 520, "Helvetica", 7, 10, MUTED)
    c.showPage()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cjk-font", default="C:/Windows/Fonts/msyh.ttc")
    args = parser.parse_args()
    pdfmetrics.registerFont(TTFont("CN", args.cjk_font, subfontIndex=0))
    facts = json.loads((ROOT / "case-facts.json").read_text(encoding="utf-8-sig"))
    selected = verify_facts(facts)
    destination = ROOT / "opencorvus-case-brief-en-zh.pdf"
    c = canvas.Canvas(str(destination), pagesize=(W, H), pageCompression=1, invariant=1)
    c.setTitle("OpenCorvus - inspectable delivery: a DeBERTa case")
    c.setAuthor("OpenCorvus")
    c.setSubject("Original bilingual commentary on a pinned public case; not a fresh reproduction")
    page(c, facts, selected)
    page(c, facts, selected, chinese=True)
    c.save()
    print(f"Built {destination.name}; six confusion-matrix calculations verified")


if __name__ == "__main__":
    main()
