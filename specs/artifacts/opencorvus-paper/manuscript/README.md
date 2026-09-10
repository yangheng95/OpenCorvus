# OpenCorvus non-experimental working manuscript

The current assistant wrote this manuscript directly. OpenCorvus is the research subject; the OpenCorvus platform was not used to create or run a writing Task. No writing agent was delegated. Independent read-only review is a separate delivery check.

- [LaTeX source](main.tex), [PDF](main.pdf), [references](references.bib).
- [Source map](source-map.md): passages to existing claim IDs and exact inspected source anchors; not another implementation-status registry.
- [Citation audit](citation-audit.md): fixed versions, reading scope, and bibliographic verification.
- [Evaluation protocol](chapters/05-evaluation.tex): the sole protocol text, included directly in the paper. It contains proposed settings, not executed results or an already frozen preregistration.
- [Editable figures](figures/README.md), [delivery checks](validation.md).

Build from this directory with `latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex`. The build uses pdfLaTeX and BibTeX; standard TeX Live packages are sufficient. The inspected source is `bd2d6bd18eda05f35326adc231289e56d0a2dfcf`; the documentation-only parent of manuscript work is `a1d8229726eedcbfc653cdc2cde9ec4419b9a527`.

This is a non-experimental working paper. Results, their interpretation, and corresponding abstract/conclusion sentences remain explicitly pending. Baseline revision, enrolled tasks, actual provider model identity, sample-size calculation, and the final execution manifest remain to be frozen before any experiment. Author names, affiliations, venue requirements, and accountable author approval remain to be supplied before submission. No experiments, new payments, or external paper submissions were performed.

The requested model for future experiments is `openai/gpt-5.6-luna`. The main-task model-switch interface returned `Transport closed`; its switch was not confirmed. After the user explicitly requested direct authorship, the current assistant proceeded without claiming that this authoring session had switched to Luna. The independent reviewer is separately configured as gpt-5.6-luna.

The existing foundation `evidence/`, `cases/`, `experiments/`, `figures/`, and `integration/` directories are preserved as read-only historical inputs. Their old acceptance status is not a certification of the new manuscript.
