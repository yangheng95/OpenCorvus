# OpenCorvus: Evolving Expert Organizations for Professional Work

This directory contains the single current English manuscript. The user sets the final length; this working version has no author-imposed page target. Its research subject is reusable expert organizations, domain specialization, and experience-driven updates that persist across tasks.

- [LaTeX source](main.tex), [PDF](main.pdf), [bibliography](references.bib).
- [Method and update policy](chapters/03-design.tex).
- [Experimental design](chapters/05-evaluation.tex): the only maintained protocol text.
- [Source map](source-map.md), [citation audit](citation-audit.md), [color scientific figures](figures/README.md).
- [Build, visual inspection, and independent review](validation.md).

The method defines organization structure, domain specialization, candidate construction, matched comparison, and revision retention. It distinguishes the current text-oriented authoring policy from the broader structural edit space accepted by the package validator. Analysis covers inherited capabilities, version isolation, total search cost, and held-out evaluation. The experimental design compares a strong single agent, a fixed team, a specialized team, and an organization with retained procedural updates, plus a GEPA-based optimizer control on the same package.

No performance numbers or experimental benefit are fabricated. The remaining empirical work is the frozen, budget-accounted execution of the protocol. Dataset enrollment, exact model/inference configuration, run counts and actual author identities must be finalized before experiments and submission. This working manuscript is not a submission-ready empirical paper.

## Build

Use the unchanged [official ICLR 2027 style archive](../templates/iclr2027/README.md). From this directory, reconstruct the ignored extraction if absent and compile:

```powershell
Expand-Archive -LiteralPath ..\templates\iclr2027\iclr-2027-style-files.zip -DestinationPath ..\templates\iclr2027\source
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

The main file loads the official package directly. Document-level patches only replace submission-status text with working-manuscript text; they fail loudly if the expected title text changes. No official style, margin, font size, or line spacing is modified.

## Authorship and scope

The current assistant writes directly; OpenCorvus is the research subject and is not used to run writing tasks. A separate default-model agent performs read-only independent academic review, as explicitly authorized by the user after Luna review instances did not return useful progress. Earlier review passes on the superseded manuscript do not establish this version's quality.

The user requested gpt-5.6-luna for project work. The model-switch interface previously returned Transport closed, so no successful main-session switch is asserted. No model experiment was executed for this manuscript iteration.

The product reference is bd2d6bd18eda05f35326adc231289e56d0a2dfcf. Historical foundation evidence, cases, experiments, root paper figures, and integration files remain unchanged. Product code, user credentials, payments, and external submission are outside this editing iteration.
