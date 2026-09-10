# OpenCorvus: Evolving Expert Organizations for Professional Work

This directory contains the single current English manuscript. The user sets the final length; this working version has no author-imposed page target. Its research subject is reusable expert organizations, domain specialization, and experience-driven updates that persist across tasks.

- [LaTeX source](main.tex), [PDF](main.pdf), [bibliography](references.bib).
- [Method and update policy](chapters/03-design.tex).
- [Preliminary evaluation](chapters/05-evaluation.tex): the current results chapter, using the existing 100-case summary.
- [Source map](source-map.md), [citation audit](citation-audit.md), [color scientific figures](figures/README.md).
- [Build, visual inspection, and independent review](validation.md).

The method defines organization structure, domain specialization, candidate construction, matched comparison, and revision retention. It distinguishes the current text-oriented authoring policy from the broader structural edit space accepted by the package validator. Analysis covers inherited capabilities, version isolation, total search cost, and held-out evaluation.

The current experiment chapter reports the existing operator-confirmed AutomationBench result: OpenCorvus Mission Base with gpt-5.6-luna, 100 cases, 34% strict pass. The historical 8.07% Luna reference appears separately with its unmatched-sample limitation. Case membership, exact run/model configuration, original state/trajectory evidence, cost totals and controlled ablations are unavailable in the current result bundle. The chapter supplies no fabricated significance, failure breakdown, cost advantage, or evolution result.

The user explicitly stopped new runs and requested this initial chapter from existing results. The earlier seven-arm, repeated-seed, large-matrix and lineage execution designs are withdrawn. No new model run, environment installation or worktree creation occurred. A historical branch contains the original batch scripts, but its current revision is not asserted to be the revision of the reported 100-case run. The manuscript remains a working paper with preliminary results, not a complete empirical validation of EEO.

## Build

Use the unchanged [official ICLR 2027 style archive](../templates/iclr2027/README.md). From this directory, reconstruct the ignored extraction if absent and compile:

```powershell
Expand-Archive -LiteralPath ..\templates\iclr2027\iclr-2027-style-files.zip -DestinationPath ..\templates\iclr2027\source
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

The main file loads the official package directly. Document-level patches only replace submission-status text with working-manuscript text; they fail loudly if the expected title text changes. No official style, margin, font size, or line spacing is modified.

## Authorship and scope

The current assistant writes directly; OpenCorvus is the research subject and is not used to run writing tasks. A separate default-model agent performs read-only independent academic review, as explicitly authorized by the user after Luna review instances did not return useful progress. Earlier review passes on the superseded manuscript do not establish this version's quality.

The user requested gpt-5.6-luna for project work. The model-switch interface previously returned Transport closed, so no successful main-session switch is asserted. No model experiment was executed for this manuscript iteration; the numerical result is a historical operator-confirmed observation.

The product reference is bd2d6bd18eda05f35326adc231289e56d0a2dfcf. Historical foundation evidence, cases, experiments, root paper figures, and integration files remain unchanged. Product code, user credentials, payments, and external submission are outside this editing iteration.
