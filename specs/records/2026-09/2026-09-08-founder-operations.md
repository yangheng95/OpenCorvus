# OpenCorvus founder operations

## Recall

- User request: 从现在开始，把你自己当作一个创业人员，负责将opencorvus运营出来，包括产品设计和实现、概念营销、宣传物料、公关，自主治理自主维护，执行 open-ended goal。
- Acceptance: sustain a prioritized operating backlog, deliver reviewed improvements, prepare usable communication assets, and measure real adoption. Becoming a star open-source project is an ongoing ambition, not a completed deliverable or guaranteed outcome.
- Constraints: obey root AGENTS.md; preserve concurrent changes; analyze before implementing; one current source per capability; review by an uninvolved read-only agent; scoped commits and normal upstream merge/push. External messages, publication, paid services and Provider credentials require specific authorization. No new branch, worktree, runtime restart, telemetry or UI automation.
- Sources read: root AGENTS.md, package.json, README.md, SUPPORT.md, CONTRIBUTING.md, .github/ISSUE_TEMPLATE/{config,question}.yml, .husky/pre-push, specs/current/architecture/public-website.md, September indexes and interrupted-task reconciliation; August promotion-case-engine-strategy and long-horizon-and-evolution-repositioning; English quickstart source and public pages.
- Searches: repository record filenames for launch/marketing/growth/position/promotion/public/readme; current specs and community files for growth/marketing; community-facing root files and .github for old domain references. Existing August case strategy remains the source of case-production methodology. This record owns execution priorities and results; it does not replace product architecture.
- Independent agent feedback: 无（实施前）；first-cut review to be recorded below.
- Starting checkout: `v0.0.55beta`, HEAD `89d67e0fa`, upstream `origin/v0.0.55beta`, zero divergence after fetch. Default public branch is `main`; branch name is not a release-version claim.
- Other work: `packages/opencorvus/src/session/index.ts`, `packages/web/src/content/expert-squad-distribution.generated.ts`, `packages/web/src/content/public-market-zh-01-35.ts` were already dirty. Preserve and exclude them.

## Decision and first-cut analysis

Start with technical founders, open-source maintainers and agent power users who have a concrete multi-step deliverable. This is a testable audience hypothesis, not established product-market fit. Retain the existing long-horizon positioning and August case strategy. The first product objective is one independently checked first result; expanding the feature inventory is lower priority until this path works.

Observed support defect: SUPPORT.md sends help seekers to `https://opencorvus.ai/docs` and its troubleshooting child. Current website architecture and the public working pages use `https://opencorvus.com/start/quickstart/` and `/troubleshooting/`. The direct trigger is clicking the support instructions. The data-flow root is a manually maintained community document that retained the former documentation origin while website routes changed. No evidence establishes why earlier delivery omitted it; that historical cause is unknown. Do not infer whether the old domain is controlled by the project or redirects.

Impact: onboarding/support navigation only. Fix these two destinations in the existing support document. No runtime, route, configuration, persistence, scheduling, API (Application Programming Interface), permission or UI (User Interface) contract changes. No replacement implementation or new link registry is needed for two prose links. Validation is live retrieval of the destinations, diff review and the repository documentation checker. A rendered application or completed first task is not claimed by this cut.

Public quickstart lists `/retry`, `/replan` and a minimal task request, while current README describes message-driven continuation. This is a concrete documentation inconsistency requiring a complete route/schema/caller audit before editing. It is not evidence that the scheduler itself is broken. Public download text extraction includes an unavailable-manifest state; without script execution this does not prove a download outage. Keep both boundaries explicit.

## Baseline — 2026-09-08

| Measure                                        | Observation                                                    | Evidence and limitation                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Stars / forks                                  | 176 / 23                                                       | Anonymous GET `https://api.github.com/repos/yangheng95/opencorvus`; point-in-time interest, not adoption |
| Open issues count                              | 10                                                             | Same API field includes pull requests; not ten confirmed bugs                                            |
| Public source branch                           | main                                                           | Same repository API; working branch is separate                                                          |
| Stable latest release API                      | HTTP 404                                                       | `/releases/latest`; does not establish absence of prereleases or a download outage                       |
| Quickstart / troubleshooting                   | Public pages retrieved                                         | Content availability only; first-run instructions not yet accepted                                       |
| First successful user result / seven-day reuse | Unknown                                                        | No consented user cohort or usage dataset measured                                                       |
| Existing assets                                | README links bilingual Mission video and workbench screenshots | Inventory only; media bytes and final visuals not reviewed in this cut                                   |

North-star measure: unique consenting users who obtain a deliverable they independently accept and return for another task within seven days. Initially collect voluntary feedback through existing support channels, using anonymized cohort codes and only necessary facts; do not introduce tracking. Count unavailable observations as unknown. Report first-result rate with its denominator (successful users / observed starters), median first-result time only over measured successes, and second-task reuse over users whose seven-day observation window has elapsed. Stars, views and downloads remain separate interest signals.

## Operating queue

| Priority / ID | Work                                                | Acceptance / next action                                                                                                                                                                                                            | State                                                                   |
| ------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| P0 OPS-001    | Establish operating record and repair support links | Current destinations retrieved; docs checker; independent review; scoped commit/push                                                                                                                                                | Delivered: a5e73dba9                                                    |
| P0 OPS-002    | Verify first-use path in both languages             | Audit actual CLI, model setup, request schema, task continuation and troubleshooting; repair confirmed drift; exercise isolated real page and inspect screenshots; real model execution only with authorized credentials and budget | Documentation delivered; real first Task and deployed verification open |
| P1 OPS-003    | Produce one evidence-backed flagship case           | Reuse August case strategy; select existing case after inspecting inputs, outputs, exact revision, model, failures and acceptance; publishable redacted evidence package and real reviewed media                                    | Pending                                                                 |
| P1 OPS-004    | Prepare bilingual outreach                          | Concrete initial copy below; bind to accepted case and verified links; user approves exact channel/account/copy before external delivery                                                                                            | Draft prepared                                                          |
| P1 OPS-005    | Recruit and learn from a small voluntary pilot      | Proposal: five technical users, at least three independently accepted first results and two seven-day repeat users; targets are experimental, not actual results                                                                    | Await case readiness, then specific outreach authorization              |
| P2 OPS-006    | Make contribution opportunities approachable        | Review actual issues and contributor guide; draft small reproducible tasks with explicit acceptance; only label/post with explicit external authorization                                                                           | Pending                                                                 |

Each continuation first rereads Recall and Git status, reconciles concurrent ownership and the last delivery, then completes the highest-impact unblocked slice. Avoid duplicate audits and keep failures attached to the original acceptance. Record each slice here with commit and validation evidence. Report only meaningful delivery, changed evidence, failures or concrete support needs. The active open-ended goal supplies current continuation; no wall-clock unattended availability is promised and no additional recurring automation has been created.

## Bilingual communication draft — not posted

### Positioning

中文：OpenCorvus 是面向长程任务的开源 Agent 工作台，把多阶段工作、专家团协作和可检查的交付放在一起。

English: OpenCorvus is an open-source agent workbench for long-horizon work, bringing multi-stage tasks, expert squads and inspectable delivery into one place.

These statements describe repository capabilities, not a promise that every model or task succeeds. Preserve the distinction between Mission-level squad composition and one fixed squad per Task. Runtime must remain online for unattended work; users supply a reachable model provider. Never claim autonomous installation of squad revisions, guaranteed quality, benchmark superiority or customer adoption without evidence.

### Chinese introductory post

长任务最难的部分，往往出现在第一份草稿之后：谁接着做、结果如何检查、哪里还没完成？

我们在做 OpenCorvus，一个面向长程任务的开源 Agent 工作台。它把分阶段工作、专家团协作和交付记录放在一起，方便你检查任务是怎样推进的，以及最终拿到了什么。

它仍在积极开发，需要你配置可用的模型服务，后台工作也需要运行环境保持在线。我们希望先把一个具体任务做好，再讨论更多可能。

如果你手上有一个反复需要补步骤、查来源或整理交付的任务，欢迎通过仓库的使用问题入口描述目标和卡点。请只提供可以公开的信息。

源码与现有案例：https://github.com/yangheng95/opencorvus

### English introductory post

Long tasks often become difficult after the first draft: who takes the next step, how do you check the result, and what is still unfinished?

We are building OpenCorvus, an open-source agent workbench for long-horizon work. It brings multi-stage tasks, expert squads and delivery records together so you can inspect how the work progressed and what it produced.

It is under active development. You configure a reachable model provider, and unattended work requires the runtime to stay online. We want to learn from specific tasks that need repeated follow-up, source checking or handoffs.

If that sounds familiar, describe your goal and where you get stuck through the repository's usage-question form. Share only information you are comfortable making public.

Source and existing examples: https://github.com/yangheng95/opencorvus

### Public-relations preparation

First approach: a technical community already discussing long-running agent tasks, with a relevant accepted case and a request for critical feedback. Do not mass-message maintainers or present this as a product launch before first-use acceptance. The exact community, its current posting rules and the posting identity must be checked when proposing publication.

Suggested editor/community pitch: “OpenCorvus is an open-source workbench exploring how multi-stage agent work can retain inspectable handoffs and delivery evidence. We would like to share a reproducible case and its limitations for technical review. Would that be relevant to your audience?” This is prepared text only, not an email sent or a promise that the reproducible case is ready.

Next support request should present the accepted case, exact post, destination and account together. Request a model-run budget only after the exact case/model/cost bound is concrete. There is no immediate dependency on user input for OPS-001 or the static analysis of OPS-002.

## Evidence links

- [Current public source](https://github.com/yangheng95/opencorvus) and [repository metadata API](https://api.github.com/repos/yangheng95/opencorvus).
- [Quickstart](https://opencorvus.com/start/quickstart/) and [troubleshooting](https://opencorvus.com/troubleshooting/), retrieved this cut. Their content is not full product acceptance.
- [GitHub guidance on approachable contribution labels](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/encouraging-helpful-contributions-to-your-project-with-labels) supports the contribution-discovery step, not a growth guarantee.
- Existing [case-production strategy](../2026-08/2026-08-12-promotion-case-engine-strategy.md) and [positioning decision](../2026-08/2026-08-19-long-horizon-and-evolution-repositioning.md).

## First-cut validation and delivery

`bun run docs:check` passes (339 operations, 25 groups); staged diff whitespace checks and local Prettier checks pass. The first `bunx prettier` attempt failed while downloading a manifest; invoking the installed `node_modules/prettier/bin/prettier.cjs` with an explicit ignore-path override verified and formatted the ignored spec successfully. No dependency change was needed.

Uninvolved read-only agent `review_founder_cut` returned PASS on the complete four-file staged change, with no unresolved findings. The reviewer verified links, scope and adoption/authorization boundaries; it did not independently repeat network retrieval. Its next-cut observation is accepted: README also retains retry/replan instructions later in the file, so OPS-002 must audit README together with both quickstarts. Source inspection additionally finds required `CreateTaskInput.productPillar` missing from the quickstart payload. These remain uncorrected next-cut findings, not successful onboarding evidence.

Scoped commit and ordinary upstream delivery follow this recorded review. Runtime first-use acceptance, rendered media, external outreach, user cohort measurements and flagship publication remain open under the queue above.

## OPS-002 — first-use contract repair plan

### Recall and analysis

The previous turn made progress: commit `a5e73dba9` is present and pushed; the same three unrelated dirty files remain. This cut implements the original first-use objective. Independent implementation feedback: 无 before implementation; prior independent review identified README's internal retry/replan inconsistency.

Observed trigger: a visitor copies the minimal creation request or follows the advertised retry/replan command. Current `CreateTaskInput` requires `productPillar`; `TaskMessageInput` requires `text` and `source`; `TaskMessageResult` reports `accepted` or `not_woken`, not `queued` or `should_resume`. `orchestrator.ts` exposes message/cancel and current Task record/event reads. `task-api/index.ts` routes ordinary messages into the existing atomic continuation path; the fixed package remains bound. `transport-protocol/src/index.ts` owns directory requirements. No scheduler anomaly was observed; this is drift in hand-maintained documentation, not grounds for changing production scheduling.

Sources and scope: both README files; both start/install and start/quickstart pages; both Mission/Task guide pages; portable Skill HTTP/operations/troubleshooting/sources references; CLI serve/network/doctor, platform capability collector, configuration resolver, Task schemas/creation/continuation, route handlers and transport directory policy. Repository search for retired Task retry/replan URLs and response fields found the above connected public/assistant entry points. Existing agent-host integration pages already describe ordinary-message continuation. Historical architecture establishes one continuation path. Runtime API generation/checking covers generated reference operations, while these prose examples remained independently authored; the exact historical omission is unknown.

Additional first-use defects: placeholder `<task_id>` is unsafe to copy unquoted in shell; model/provider setup is absent from quickstart; install pages hard-code a model then offer unrelated providers, overstate doctor as a live model check, and point to the old install origin. `Capability.collectFresh` only checks local platform modules/shell. Fix installation navigation to the existing downloads and release inventory, keep exact model selection explicit, and stop promising five-minute completion. Do not run an installer, contact a Provider, read credentials or operate an existing runtime.

Implementation: retain the same documentation routes and styling; rewrite bilingual first-use instructions around a bounded repository overview artifact and its acceptance; include Bash and PowerShell submission plus ordinary-message continuation; repair matching README/Skill/API-guide claims rather than reintroducing removed routes. Preserve unrelated Mission contract content. This changes documentation only: no new production route, configuration source, schema, SDK, data, scheduler, UI component, dependency or telemetry.

Validation: execute production schema parsing on the documented request shapes and directory-policy checks without Provider execution; run `docs:check`, formatting and Skill validation; render the actual bilingual documentation pages with isolated Astro development service (the application `/ui` does not serve public website docs), inspect screenshots and real navigation. No UI automated tests. A real model-completed first Task and deployed-site verification remain explicitly outstanding unless separately authorized. Review the entire diff independently, resolve valid findings, commit and push normally. Existing public-page content and screenshots are not final local acceptance. Check model usage authorization only once an exact model/case/budget request is prepared; other operating work remains available.

### Implementation and first verification

The bilingual install/quickstart pages, README examples and Mission/Task guide now document the required product pillar and model setup, use ordinary messages for continuation, and distinguish accepted requests from accepted deliverables. Quickstart includes three PowerShell blocks per locale, with explicit UTF-8 bytes for Chinese request bodies. Portable Skill references use the same current message response contract and continuation path. No runtime implementation was changed.

Production `CreateTaskInput` and `TaskMessageInput` parsed the exact two Bash JSON bodies extracted from each quickstart (four successful schema parses), under a fresh temporary `OPENCORVUS_HOME`. The production directory policy returned required for Task creation/message and optional for Task board/events reads. `TaskMessageResult` parsed the current accepted response. The actual PowerShell parser accepted all six PowerShell code blocks. These are request-shape checks, not submitted Tasks or model-quality evidence.

`docs:check` passes (339 operations, 25 groups), all 13 task-owned Markdown/MDX files pass Prettier, and diff whitespace checking passes. Skill quick validation passes using bundled Python; the system `python` was a Windows Store stub and bundled Python lacked PyYAML. PyYAML 6.0.3 was installed only under the system temporary directory for this validator, with no repository dependency changes.

Real website preview: isolated `http://127.0.0.1:4399`, created by this task. Initial Node Astro preview showed `ERR_UNSUPPORTED_ESM_URL_SCHEME` for `bun:` because the website's dynamic routes require Bun. Stopped only that newly created server and relaunched using `bun --bun node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4399`; browser interaction remained in the in-app browser. Actual screenshots were viewed for both quickstarts (model setup, submission/PowerShell and continuation regions), both installation pages, and both API-guide creation regions. Sidebar/anchor navigation worked and text/code/table layout remained readable. Long PowerShell requests were split after the initial visual inspection and the Chinese result re-screenshotted. Evidence is the browser-tool screenshots in this task, not a generated screenshot baseline or UI test. The website preview is not the OpenCorvus application runtime and does not prove model execution or live deployment.

Independent read-only reviewer `review_onboarding_contract` returned PASS on all 13 staged files and the related production contracts, with no unresolved findings. It separately confirmed required inputs, message response states, immutable-package continuation, directory rules, active profile behavior and doctor's local-only checks. It did not repeat browser or Provider acceptance. Both final PowerShell layouts were re-screenshotted after editing. Live HTTP HEAD reads returned 200 for all 16 linked local English/Chinese install, quickstart, API guide, provider, network, permission, Slack and troubleshooting routes.

Scoped Git delivery follows this review. OPS-002 remains open for a credential-authorized real first Task, application workbench acceptance and published-site verification; those requirements are not replaced by this documentation slice. After delivery, proceed to inspect existing flagship-case evidence under OPS-003 while preparing the exact real-run and publication requests; do not stop the overall operating goal on those authorization boundaries.

## OPS-003 — public case evidence and bilingual brief

### Recall and pre-authoring decision

Previous turn: progress, verified by pushed commit `31942088f`; the three unrelated dirty files remain unchanged. Original goal and all open first-use, adoption and publication requirements remain in scope. This cut produces an original two-page bilingual PDF case brief and a traceable fact ledger, not another product-plan-only deliverable. Independent feedback before implementation: 无.

Current sources: the website's single composition source links `yangheng95/deberta-v3-absa-public-evidence`. Anonymous GitHub API resolves main to `ee54b400efac03ed665d86c45653dc4239b4c285`. Read its tree, README, public process index, comparison, best-model, canonical confusion matrices, evaluation events, local verification record, reproducibility and limitations. The August 9 CPU lab and the later public CUDA case are separate evidence sets; do not merge their scores or timelines. The public snapshot records three runs, seed 42, one epoch, 1,800 training / 700 validation / 1,336 test examples, validation-only selection and single-run uncertainty. Recompute macro-F1 from the six published matrices before using rounded results. This is arithmetic validation of published summaries, not verification of excluded raw predictions or a new training run.

Depth and impact: marketing labels such as audited or complete do not establish runtime provenance. The snapshot excludes original console streams, checkpoints, complete datasets and internal runtime records; its Stage 4 process-index target is absent from the public tree while Stage 4 is explicitly superseded. Record this navigation limitation without treating it as a changed scientific result. Stage 6 status remains prepublication in the process record; the current public commit proves public availability separately. The 12h45 video claim is not re-established by these records, so omit it from this new brief. The repository grants no license for its authored code/docs: link to it and write original commentary; do not copy its paper, diagrams, code or media into OpenCorvus's MIT tree. No product/runtime/schema/scheduler change or external repository write is needed.

Output plan: `specs/artifacts/2026-09-08-founder-case-brief/` contains derived numerical facts with exact source URLs and response hashes, an original PDF builder, a two-page English/Chinese brief, and a README with source/audit boundaries and ready-to-review outreach text. PDF uses an original typographic layout and charts, not copied assets. Follow PDF skill for generation and Poppler rendering; inspect both final pages for typography, clipping and factual labels. Root spec/artifact and monthly indexes link the new deliverable. Validate arithmetic, final PDF text/page count, rendered pages, links, formatting and repository docs; independently review the full scoped diff; commit and push. External posting, outreach, source-repository edits, GPU/model execution and public website deployment are not performed by this cut.

### Brief verification

Created the original bilingual brief, fact ledger, builder and unsent outreach copy. All six published confusion matrices recompute within 1e-14; PDF extraction confirms two pages, both headline scores and five clickable links per page. Both Poppler-rendered pages were visually inspected; the Chinese introduction was shortened and re-rendered to repair a punctuation wrap. Poppler emits missing optional display-font warnings, but embedded Chinese text and page rendering are readable. docs:check passes (339 operations, 25 groups). This cut provides prepared media and public-summary arithmetic verification only; reproduction, source provenance gaps, real onboarding and external publication remain open.

Independent read-only reviewer review_case_brief returned PASS on all eight staged files and both rendered pages. It independently retrieved and matched all six source hashes and matrices, checked counts/scores, PDF links and factual boundaries. All five unique PDF links also returned HTTP 200 in the main review. No unresolved findings. Review did not run training or inspect external raw assets. OPS-003 now has prepared, visually reviewed bilingual media; source provenance and publication remain open. Scoped commit and ordinary upstream push follow this review.
