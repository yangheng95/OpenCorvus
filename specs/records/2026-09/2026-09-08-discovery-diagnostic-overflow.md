# Expert Squad discovery diagnostic overflow

## Recall

- Request: repair the screenshot's General `/vcs` and `/skill/mounts` HTTP 500 errors.
- Acceptance: preserve explicit package issues within the current 4096-character diagnostic contract; healthy catalog/configuration and both real HTTP routes succeed with oversized invalid-package diagnostics.
- Constraints: preserve concurrent dirty files, installed packages and running user processes; no credential use, compatibility path or UI automation. Commit scoped changes, independently review, merge upstream and push.
- Read: registry discovery and schema, profile resolver, candidate validation, project bootstrap, skill routes/matrix, server error handler, architecture 04-extensions, catalog tests and production-route probe, package scripts.
- Searches: all package `4096`/message limits, registry diagnostic producers and consumers, shared discovery paths. Registry `discoveryIssue` is the shared producer for global/project identity and catalog failures. No existing bounded diagnostic primitive found in the searched util/registry paths.
- Independent agent feedback: none before implementation; required after first validation.

## Analysis and scope

Live 2026-09-08 logs identify `config.validate` during project open as the shared failure, preceding requested route handlers. `assertKnownProfileID` discovers installed packages even for built-in selection. `discoverAvailableFromIdentities` catches malformed declarations, but `discoveryIssue` passes unlimited `Error.message` into `DiscoveryIssue.message.max(4096)`. This secondary validation exception escapes discovery and becomes `ConfigCandidateValidationError`, masking the package failure and blocking unrelated project routes.

Read-only current-parser inspection of actual global installed manifests found `builtin/deep-research` and `builtin/equity-research` errors of 9097 and 10286 characters (old schema version and capability projection fields); `local-e2e/release-readiness` produces 4037 characters. Installed bytes remain untouched. The old implementation isolates short errors only, which explains why package-level recovery fails for larger declarations.

Change only the common diagnostic producer, sharing its length bound with the existing schema. Preserve short messages exactly; bound long messages with an explicit truncation suffix and original length. Keep phase, location and identity. This is diagnostic normalization, not acceptance of invalid packages. Exact active invalid packages and project-over-global reservation retain existing rejection contracts. Public shape/schema remain unchanged; no generated API update or database migration is needed. No scheduler/control-state defect is implicated by this causal chain; separate historical startup-recovery warnings are outside this screenshot repair.

## Implementation and validation plan

1. Add positive filesystem-backed discovery regression tests for oversized identity/catalog errors and unchanged short errors across global/project scopes.
2. Verify a failing test before repair, normalize diagnostics at their producer, and rerun.
3. Exercise full Server HTTP project bootstrap, `/vcs` and `/skill/mounts` using an isolated runtime and malformed packages; preserve healthy built-in output and invalid selected-package error contracts.
4. Run document checks and focused code checks; independent read-only review, scoped commit, upstream merge/push.

## Evidence

- Before repair, the focused regression run produced 0 pass / 3 fail: global and project scans threw the same `message` / 4096 error; the real `/vcs` HTTP request returned 500 with `ConfigCandidateValidationError`.
- After repair, `bun test --cwd packages/opencorvus test/expert-squad/discovery-diagnostic.test.ts --timeout 60000`: 4 pass, 19 assertions. Covers global/project oversized catalog diagnostics, short-message preservation, oversized malformed JSON identity diagnostics, explicit failure for selected invalid profile, and usable built-in catalog.
- Full `Server.App()` on an isolated real loopback HTTP listener completed project bootstrap and returned `/vcs` 200 with a branch and `/skill/mounts` 200 with `active_profile: base`, agents and skills. No mock Provider, model request or running user process was needed.
- `bun run typecheck` in packages/opencorvus: exit 0. Root `docs:check`: 339 operations / 25 groups, pass; `check:architecture-index`: 16 documents, pass. `git diff --check`: pass.
- `bunx prettier` failed at registry manifest download; using the already installed `node node_modules/prettier/bin/prettier.cjs` completed formatting. Unrelated pre-existing formatting was restored precisely.
- Independent read-only review found no functional defect; requested evidence completion and explicit inclusion of the ignored new spec. Final read-only recheck confirmed all findings closed: evidence complete, unrelated formatting restored, and exactly five task-owned files staged including the new spec.

Source repair does not update or restart the installed desktop binary; real running-window visual acceptance is not claimed. Installed legacy packages remain invalid and retain their original bytes; repair restores failure isolation instead of silently upgrading declarations. Git delivery status is reported with the final task result.
