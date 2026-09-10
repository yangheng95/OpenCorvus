# Manuscript delivery validation

## Scope and identity

- Product source frozen at `bd2d6bd18eda05f35326adc231289e56d0a2dfcf`; no product source changed.
- Current assistant authored the paper directly; no OpenCorvus writing Task or writing delegate was used.
- User-requested Luna switch for the main session could not be confirmed (`Transport closed`). No claim of Luna main-session authorship is made. Independent review is configured separately as gpt-5.6-luna.
- Existing foundation evidence/cases/experiments/figure-inputs/integration preserved unchanged.

## Completed first-pass checks

- `latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex`: passed, pdfLaTeX/BibTeX, TeX Live 2023. Final log after citation/layout correction has no undefined citations/references, overfull/underfull boxes, or LaTeX/natbib warnings. Initial bibliography spacing warning was corrected by ragged-right references.
- Initial fully referenced PDF: 20 pages, A4, PDF 1.5. Page count will be checked again after review changes.
- `pdffonts main.pdf`: all 16 listed font instances embedded and subsetted, with Unicode mappings.
- `bun run docs:check`: passed, 339 operations / 25 groups.
- `git diff --check`: passed for tracked changes. Newly created artifact files require explicit staging because the repository ignores artifact outputs by default; staged diff will be checked separately.
- arXiv authors/title/date metadata queried for all seven fixed manuscript versions. PROV editors/version checked on W3C. Lamport publication metadata checked on author page. Gray/Cheriton original paper read for lease/clock scope.
- Holm original PDF retrieved after web timeout; text confirms author, title, journal 6(2), 65-70 and sequential multiple-testing definition. Efron original scan metadata verified; relevant pages rendered for visual reading.

## Visual and independent checks

- All current PDF pages rendered to `qa/page-*.jpg` at 96 dpi. The ordinary image-view tool fails because the Windows sandbox cannot apply deny-read ACLs; reading the same generated JPEGs through an approved read-only shell call and forwarding image bytes provides actual visual inspection without modifying system permissions.
- Main assistant inspected all 20 pages of the first complete render, then the six changed pages of the 19-page layout revision. Figure 3's connector, Results float placement, and bibliography/appendix layout were corrected and visually confirmed. After the statistical correction, all 11 changed pages were re-rendered and viewed; the other 9 pages have identical JPEG hashes to already inspected pages. The final 20-page PDF has no observed clipping, overlapping text, broken formulas, or missing glyphs. The appendix occupies a separate complete final page.
- Independent gpt-5.6-luna reviewer `review_paper_plan` completed the first manuscript review with two findings: fixed-task estimand versus task-bootstrap interval mismatch (P1), and an overbroad statement that no checker ran (P2). Other inspected argument, source, citation and historical-boundary claims had no substantive finding.
- P1 addressed: primary interval now uses exact binomial intervals for the fixed task-condition cells with a simultaneous union-bound construction; within-cell independence/stability assumptions, pairing inefficiency, conservative width, and infeasible precision limits are explicit. Task-cluster bootstrap is only a heterogeneity sensitivity analysis. Sample-size planning uses the same primary interval and varies repetitions before confirmatory execution. Clopper/Pearson's original 1934 paper and publisher metadata were checked.
- P2 addressed: source-map.md now distinguishes product/runtime behavioral checkers from manuscript build, citation, documentation and layout checks.
- Second independent review confirmed both original issues closed and the statistical construction valid under its stated assumptions. It found one ambiguous chapter-number reference in source-map.md. The mapping now links directly to the actual LaTeX files and identifies the rendered evaluation section as Section 7, avoiding confusion with file number 05. The third focused read-only review completed and confirmed the mapping, arguments, protocol, references, source correspondence, PDF measurements and staged scope. Its sole remaining request was to replace this now-stale pending-review sentence; that receipt correction is applied here. No substantive finding remains unresolved.

## Final artifact measurements

- PDF: 20 A4 pages, 371019 bytes; SHA-256 `113ecf92c04197860a5c2e2c712bf1ad2bbb8e154337625841e22fa3afd6bd33`.
- References: 16 resolved BibTeX entries. Bibliography processing reports no warnings; final LaTeX log has no unresolved citation/reference or overfull/underfull warning.
- Fonts: 16 listed font instances, all embedded, subsetted, with Unicode mappings.
- Source and historical evidence diff: no changes in the inspected product files or protected foundation directories.
- Product/fault/model experiments: not run. The interval formulas were analytically reviewed; no simulated experiment is represented as data.
- Local artifact links: 24 checked, all targets present. Citation-key audit: 16 cited keys and 16 bibliography entries, all resolved and used.

## Evidence boundaries

No model/benchmark/fault experiment, UI automation, original historical database replay, or independent adoption study was run. Proposed protocol values are planning parameters. Baseline/task/provider freeze, pilot precision calculation, raw outcomes, empirical interpretation, author identities, and submission review remain outside this non-experimental delivery.

The shell's default sandbox has an ACL initialization fault. Commands above used the normal escalation review with explicit task scope; no ACLs or user processes were changed. The first `pdftotext` path assumption was corrected to the installed TeX Live executable and the same reference check was re-run successfully. Poppler messages about display fonts occurred while reading external scans; the generated manuscript's fonts are embedded.
