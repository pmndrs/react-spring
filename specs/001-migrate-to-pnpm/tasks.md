---
description: "Task list for: Migrate package manager from Yarn 3 Berry to pnpm"
---

# Tasks: Migrate package manager from Yarn 3 Berry to pnpm

**Input**: Design documents from `/specs/001-migrate-to-pnpm/`

**Prerequisites**:
- `plan.md` ✅
- `spec.md` ✅
- `research.md` ✅
- `data-model.md` ✅
- `contracts/developer-commands.md` ✅
- `contracts/ci-commands.md` ✅
- `quickstart.md` ✅

**Tests**: This is a tooling migration. The "tests" are the existing project test suites (Jest unit, `tsc --noEmit`, Cypress E2E) — they MUST continue to pass. No new test files are added by this work. Verification tasks below run those existing suites.

**Organization**: Tasks are grouped by user story (US1–US4 from `spec.md`). Phase 0 (Baseline), Setup, Foundational, and Polish phases are story-independent prerequisites or cross-cutting.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Different files, no dependencies on incomplete tasks → can run in parallel.
- **[Story]**: Maps to user stories US1, US2, US3, US4.
- Every task names an exact file path or directory.

---

## Phase 0: Baseline Capture (Pre-Migration)

**Purpose**: Record yarn-side timing and packing baselines BEFORE any pnpm change touches the repo, so SC-001 / SC-002 / SC-003 / SC-005 can be evaluated post-migration against a real comparator.

**⚠️ CRITICAL**: This phase MUST complete on a clean `next`-branch checkout (no pnpm artefacts present) before Phase 1 begins. Skip it and the timing/equivalence SCs become unfalsifiable.

- [ ] T001 From `/Users/josh.ellis/code/react-spring` on a clean checkout of `next` (no `node_modules`, no `.pnpm-store`), measure cold yarn install time: `time yarn install --immutable`. Then delete `node_modules`, re-run, and record warm-cache time. Capture in `/Users/josh.ellis/code/react-spring/specs/001-migrate-to-pnpm/baseline.md` under headings "Cold install (yarn)" and "Warm install (yarn)". Also run `time yarn build-ci && time yarn test:ts && time yarn test:unit` and record. Also `time yarn package` for every published workspace and record per-package pack time. Then `yarn pack` each published workspace (every dir under `packages/` and `targets/` whose `package.json` lacks `private: true`) into `/Users/josh.ellis/code/react-spring/specs/001-migrate-to-pnpm/baseline/<workspace>.tgz`, and write the extracted file list + the `name`/`version`/`exports`/`main`/`module`/`types`/`files` fields of each `package.json` to `baseline.md`. Commit `baseline.md` and the tarballs under `baseline/` to the migration branch — they're the post-migration comparator and will be deleted in T064.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Introduce the new pnpm configuration surface alongside the existing yarn one. After this phase the repo contains both — that's intentional; Phase 2 collapses to pnpm-only.

- [ ] T002 Create `pnpm-workspace.yaml` at repo root containing exactly the four live workspace globs from `research.md` R-002: `packages/*`, `targets/*`, `demo`, `docs`. Do NOT include `packages/parallax/@react-spring/parallax-demo` (the directory does not exist on disk).
- [ ] T003 Update root `/Users/josh.ellis/code/react-spring/package.json`: (a) remove the `workspaces` field entirely, (b) change `packageManager` from `yarn@3.8.7` to `pnpm@<latest 9.x.y>`, (c) add a `pnpm.onlyBuiltDependencies` array seeded with `["@swc/core","cypress","esbuild","@remix-run/dev","@parcel/watcher","core-js","core-js-pure"]` per `research.md` R-003. Leave every script body and every `devDependencies` entry untouched in this task — script rewrites happen in T029 / T030.
- [ ] T004 Create `/Users/josh.ellis/code/react-spring/.npmrc` containing only the registry pin (`registry=https://registry.npmjs.org/`). Do NOT add `node-linker=hoisted` or any `public-hoist-pattern` entries — strict isolation is mandatory per the spec's "Resolution mode" decision. Add hoist patterns later only if T005 reveals an unfixable case.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Generate a clean `pnpm-lock.yaml` against strict isolated `node_modules`, fix any phantom-dependency declarations the install surfaces, and remove all Yarn 3 Berry artefacts.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### 2a. Discovery install

- [ ] T005 Enable Corepack (`corepack enable`) and run `pnpm install` from `/Users/josh.ellis/code/react-spring`. Capture the full output — every "Module not found", every "An import-name-required dep is missing" warning, and every "ignored build script" notice. This is the discovery pass; T006–T021 act on its findings.

### 2b. Phantom-dependency fixes (parallel — different files)

> Each task below: read the workspace's current `package.json`, cross-reference with T005's error/warning output, and add any missing entries to `dependencies` or `peerDependencies`. If T005 reported zero issues for a workspace, mark the task complete with no edits and note "no changes required" in the PR description.

- [ ] T006 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/core/package.json` (likely candidates: `react` in `peerDependencies`).
- [ ] T007 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/animated/package.json`.
- [ ] T008 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/shared/package.json`.
- [ ] T009 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/rafz/package.json`.
- [ ] T010 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/types/package.json`.
- [ ] T011 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/parallax/package.json`.
- [ ] T012 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/mock-raf/package.json`.
- [ ] T013 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/eslint-config/package.json` (likely candidates: any ESLint plugins it loads).
- [ ] T014 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/packages/react-spring/package.json` (umbrella; should already list every target as a dep).
- [ ] T015 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/targets/web/package.json` (likely candidates: `react`, `react-dom` in `peerDependencies`).
- [ ] T016 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/targets/native/package.json` (likely candidates: `react-native` in `peerDependencies`).
- [ ] T017 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/targets/three/package.json` (likely candidates: `three`, `@react-three/fiber` in `peerDependencies`).
- [ ] T018 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/targets/konva/package.json` (likely candidates: `konva`, `react-konva` in `peerDependencies`).
- [ ] T019 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/targets/zdog/package.json` (likely candidates: `zdog`, `react-zdog` in `peerDependencies`).
- [ ] T020 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/demo/package.json`.
- [ ] T021 [P] Fix any phantom dependencies in `/Users/josh.ellis/code/react-spring/docs/package.json` (verify `@remix-run/dev` postinstall still fires after install — the root has `"postinstall": "remix setup node"` that depends on docs having the dev kit).

### 2c. Finalise lockfile + cleanup

- [ ] T022 Re-run `pnpm install` from `/Users/josh.ellis/code/react-spring`. Iterate on T006–T021 until install completes with zero `ERR_PNPM_*` errors and zero unsuppressed "ignored build script" warnings (add to `pnpm.onlyBuiltDependencies` only for dependencies we genuinely need to build).
- [ ] T023 Commit the generated `/Users/josh.ellis/code/react-spring/pnpm-lock.yaml`.
- [ ] T024 Delete `/Users/josh.ellis/code/react-spring/yarn.lock`.
- [ ] T025 Delete `/Users/josh.ellis/code/react-spring/.yarnrc.yml`.
- [ ] T026 Delete `/Users/josh.ellis/code/react-spring/.yarn/` (entire directory: `releases/`, `plugins/`, and any cache).
- [ ] T027 Update `/Users/josh.ellis/code/react-spring/.gitignore`: remove Yarn Berry patterns (`.yarn/*`, `!.yarn/patches`, `!.yarn/plugins`, `!.yarn/releases`, `!.yarn/sdks`, `!.yarn/versions`, `.pnp.*`) and ensure standard pnpm patterns (`node_modules`) remain.

**Checkpoint**: Foundation ready — strict-isolated `pnpm-lock.yaml` exists, no Yarn artefacts remain, and `pnpm install --frozen-lockfile` succeeds from a clean state. User-story work can now proceed in parallel.

---

## Phase 3: User Story 1 — Contributor installs and runs the project after migration (P1) 🎯 MVP

**Goal**: A contributor on a clean clone can install, build, test, type-check, lint, and format using the documented pnpm commands, with the same outcomes they had under yarn.

**Independent Test**: From a fresh clone with no `node_modules`: run `pnpm install --frozen-lockfile`, then `pnpm build`, `pnpm test:ts`, `pnpm test:unit`, `pnpm lint`, `pnpm prettier:check`. Each completes successfully. Pre-commit hooks fire on a test commit.

### Implementation for User Story 1

- [ ] T028 [US1] Rewrite the `docs:dev`, `docs:build`, and `demo:dev` scripts in `/Users/josh.ellis/code/react-spring/package.json` per `contracts/developer-commands.md` (replace `yarn workspace <name> <cmd>` with `pnpm --filter <name> <cmd>`).
- [ ] T029 [US1] Rewrite the `test` and `test:e2e` scripts in `/Users/josh.ellis/code/react-spring/package.json` per `contracts/developer-commands.md` (replace embedded `yarn` calls with `pnpm`, including the `start-server-and-test` quoted commands).
- [ ] T030 [US1] Rewrite the `release` script in `/Users/josh.ellis/code/react-spring/package.json` to `pnpm clean && pnpm install && pnpm build && pnpm test:ts && pnpm test:unit && pnpm changeset publish --no-git-tag` (replacing the bare `yarn` install with `pnpm install`).
- [ ] T031 [US1] On a clean clone (delete `node_modules` and any local caches first), run `pnpm install --frozen-lockfile` from `/Users/josh.ellis/code/react-spring` and verify it succeeds with zero errors. Documents acceptance scenario 1 of US1.
- [ ] T032 [US1] Verify Husky hooks fire: make a noop edit, `git add`, `git commit -m "test: husky check"` against `/Users/josh.ellis/code/react-spring` and confirm both pre-commit (Prettier) and commit-msg (commitlint) hooks run. Then `git reset --soft HEAD~1` and unstage. Documents US1 acceptance scenario 4.
- [ ] T033 [US1] Run `time pnpm build` from `/Users/josh.ellis/code/react-spring` and verify all packages build; record the wall-clock time in `baseline.md` under "Build (pnpm)" for comparison with T001 (US1 acceptance scenario 2 + FR-005 + SC-001).
- [ ] T034 [US1] Run `time pnpm test:ts` from `/Users/josh.ellis/code/react-spring`; verify type-check passes and record the wall-clock time in `baseline.md` under "Type-check (pnpm)" (US1 acceptance scenario 2 + FR-006 + SC-001).
- [ ] T035 [US1] Run `time pnpm test:unit` from `/Users/josh.ellis/code/react-spring`; verify Jest passes and record the wall-clock time in `baseline.md` under "Unit tests (pnpm)" (US1 acceptance scenario 2 + FR-006 + SC-001).
- [ ] T036 [US1] Run `pnpm lint` and `pnpm prettier:check` from `/Users/josh.ellis/code/react-spring` and verify both report clean (US1 acceptance scenario 2 + FR-008).
- [ ] T037 [US1] Run `pnpm docs:dev` and `pnpm demo:dev` from `/Users/josh.ellis/code/react-spring`; verify each dev server starts and serves content (US1 acceptance scenario 3). Kill the servers when verified.
- [ ] T038 [US1] Update `/Users/josh.ellis/code/react-spring/README.md`: replace the install/usage instructions with the content from `specs/001-migrate-to-pnpm/quickstart.md` (FR-013).
- [ ] T039 [US1] Update `/Users/josh.ellis/code/react-spring/CLAUDE.md`: rewrite the "Stack" section's package-manager line (currently `Yarn 3.8.7 (Berry, nodeLinker: node-modules)`) and every entry in the "Common commands" table (currently `yarn …`) per `contracts/developer-commands.md` (FR-013).
- [ ] T040 [P] [US1] Sweep `/Users/josh.ellis/code/react-spring/docs/` for `yarn` references in markdown content and rewrite each to its pnpm equivalent per `contracts/developer-commands.md` (FR-013).

**Checkpoint**: A fresh-clone contributor flow works end-to-end on pnpm. US1 is independently testable and complete.

---

## Phase 4: User Story 2 — CI passes on the supported Node matrix (P1)

**Goal**: Every GitHub Actions workflow installs, builds, tests, and (where applicable) publishes via pnpm; the `test-published-artifact` fixtures pass under npm.

**Independent Test**: Open the migration PR. All five workflows queue and pass on the existing Node matrix (18.x, 20.x). The `paths-filter` step in `tests.yml` correctly detects the new lockfile.

### Implementation for User Story 2

- [ ] T041 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/checks.yml`: replace the `actions/setup-node@v4` (`cache: 'yarn'`) + `yarn install --immutable` block with the standard pnpm install block from `contracts/ci-commands.md`; rewrite the `yarn lint` and `yarn prettier:check` run steps to `pnpm lint` / `pnpm prettier:check`.
- [ ] T042 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/bundle-size.yml`: same install-block swap; rewrite `yarn build --filter=!@react-spring/docs` to `pnpm build --filter=!@react-spring/docs`.
- [ ] T043 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/tests.yml` `build` job: same install-block swap; rewrite `yarn build-ci --filter=!@react-spring/docs` → `pnpm build-ci --filter=!@react-spring/docs` and `yarn package` → `pnpm package`.
- [ ] T044 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/tests.yml` `test-unit` job: same install-block swap; rewrite `yarn build-ci` → `pnpm build-ci` and `yarn test:unit` → `pnpm test:unit`.
- [ ] T045 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/tests.yml` `test-types` job: same install-block swap; rewrite `yarn add typescript@${{ matrix.ts }}` → `pnpm add -w typescript@${{ matrix.ts }}`, `yarn build-ci` → `pnpm build-ci`, `yarn tsc --version && yarn test:ts` → `pnpm tsc --version && pnpm test:ts`.
- [ ] T046 [US2] Update the `paths-filter` step in `/Users/josh.ellis/code/react-spring/.github/workflows/tests.yml` `changes` job: replace `yarn.lock` with `pnpm-lock.yaml`, replace `.github/publish-ci/**/yarn.lock` with `.github/publish-ci/**/package-lock.json`.
- [ ] T047 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/experimental.yml`: same install-block swap; rewrite `yarn build-ci` → `pnpm build-ci`.
- [ ] T048 [US2] Rewrite `/Users/josh.ellis/code/react-spring/.github/workflows/nightly.yml`: same install-block swap; rewrite `yarn build-ci` → `pnpm build-ci`.
- [ ] T049 [P] [US2] Migrate `/Users/josh.ellis/code/react-spring/.github/publish-ci/cra5/`: delete `yarn.lock`, run `npm install` to generate `package-lock.json`, commit the lockfile.
- [ ] T050 [P] [US2] Migrate `/Users/josh.ellis/code/react-spring/.github/publish-ci/next/`: delete `yarn.lock`, run `npm install`, commit `package-lock.json`.
- [ ] T051 [P] [US2] Migrate `/Users/josh.ellis/code/react-spring/.github/publish-ci/vite/`: delete `yarn.lock`, run `npm install`, commit `package-lock.json`.
- [ ] T052 [P] [US2] Migrate `/Users/josh.ellis/code/react-spring/.github/publish-ci/node-standard/`: delete `yarn.lock`, run `npm install`, commit `package-lock.json`.
- [ ] T053 [P] [US2] Migrate `/Users/josh.ellis/code/react-spring/.github/publish-ci/node-esm/`: delete `yarn.lock`, run `npm install`, commit `package-lock.json`.
- [ ] T054 [US2] Rewrite the `test-published-artifact` job in `/Users/josh.ellis/code/react-spring/.github/workflows/tests.yml`: change the `cache: 'yarn'` setup to `cache: 'npm'`, and rewrite each step per `contracts/ci-commands.md` — `yarn remove @react-spring/web` → `npm uninstall @react-spring/web`; `yarn add ./web/package.tgz …` → `npm install ./web/package.tgz …`; `yarn info … && yarn why …` → `npm info … && npm ls …`; `yarn build` → `npm run build`; `yarn test` → `npm test`. Depends on T049–T053 (fixtures must already be on npm).
- [ ] T055 [US2] Push the migration branch to GitHub and verify CI runs all five workflows successfully on the open PR. Record per-job wall-clock install times in `baseline.md` under "CI cold install (pnpm)" — comparing to the equivalent yarn timings in `baseline.md` "CI cold install (yarn)" (which the executor may need to fill in by inspecting the most recent green CI run on `next` if not already in `baseline.md`). Documents SC-002.

**Checkpoint**: All CI green on the migration PR; cache key driven from `pnpm-lock.yaml`; `paths-filter` correctly triggers on the new lockfile paths.

---

## Phase 5: User Story 3 — Releases continue via the changesets workflow (P2)

**Goal**: A maintainer can complete the changesets-driven release flow under pnpm and produce tarballs whose contents match the pre-migration baseline (per FR-015 / SC-005, with whitespace and ordering tolerated).

**Independent Test**: Run `pnpm changeset` → `pnpm vers` → the full `pnpm release` flow up to (but not including) actual `changeset publish`. Versions bump correctly; build + tests succeed; tarballs match the pre-migration baseline for every published workspace.

### Implementation for User Story 3

- [ ] T056 [US3] From `/Users/josh.ellis/code/react-spring`, run `pnpm changeset` and add a `chore` changeset documenting the package-manager migration. Verify the prompt flow works end-to-end and a `.changeset/<name>.md` file is created.
- [ ] T057 [US3] From `/Users/josh.ellis/code/react-spring`, run `pnpm vers` (changeset version) and verify every version-locked package bumps to the same target version. Then `git restore` the resulting changes to leave the branch clean.
- [ ] T058 [US3] From `/Users/josh.ellis/code/react-spring`, run the `pnpm release` script up to (but stop before) `changeset publish`. Verify `pnpm clean`, `pnpm install`, `pnpm build`, `pnpm test:ts`, and `pnpm test:unit` all succeed in sequence.
- [ ] T059 [US3] Run `pnpm pack` for **every published workspace** — i.e. every directory under `/Users/josh.ellis/code/react-spring/packages/` and `/Users/josh.ellis/code/react-spring/targets/` whose `package.json` does **not** have `private: true`. For each tarball, extract it and diff (a) the file list and (b) the `name`, `version`, `exports`, `main`, `module`, `types`, and `files` fields of its `package.json` against the corresponding tarball under `/Users/josh.ellis/code/react-spring/specs/001-migrate-to-pnpm/baseline/<workspace>.tgz` produced by T001. Whitespace and ordering inside generated metadata are tolerated; any other difference is a defect that MUST be resolved before merge. Record the diff outcome (PASS/details) per workspace in `baseline.md` under "Pack equivalence". Documents FR-015 / SC-005.

**Checkpoint**: Release flow validated end-to-end short of actually publishing. Published-artefact equivalence verified for every published workspace against the recorded baseline.

---

## Phase 6: User Story 4 — Parallax Cypress E2E suite continues to pass (P3)

**Goal**: `pnpm test:e2e` launches the Vite-served parallax test app and runs the Cypress spec to completion.

**Independent Test**: From a fresh `pnpm install`, run `pnpm test:e2e`. Cypress launches headlessly, runs `cypress/e2e/parallax.cy.ts`, and exits cleanly.

### Implementation for User Story 4

- [ ] T060 [US4] From `/Users/josh.ellis/code/react-spring`, run `pnpm test:e2e` and verify the Vite dev server starts on port 3000 against `packages/parallax/test`, Cypress launches, and `cypress/e2e/parallax.cy.ts` passes.

**Checkpoint**: E2E suite green under pnpm. All four user stories are independently testable and complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Sweep the long tail of documentation references, confirm no `yarn` invocations remain anywhere in the repo, validate the warm-cache install SC, and tear down the baseline scaffolding.

- [ ] T061 [P] Sweep `/Users/josh.ellis/code/react-spring/packages/*/README.md` and `/Users/josh.ellis/code/react-spring/targets/*/README.md` for `yarn` references; rewrite each to its pnpm equivalent per `contracts/developer-commands.md`.
- [ ] T062 Run `grep -rn "yarn " --include="*.md" --include="*.yml" --include="*.yaml" --include="*.json" --include="*.sh" /Users/josh.ellis/code/react-spring` and resolve every hit that isn't a historical reference (changelogs, releases). Specifically: also check `scripts/`, `.changeset/`, and root `.eslintrc*`/`tsconfig*`. Documents SC-007 (100% of repo-level docs updated).
- [ ] T063 Final end-to-end check from `/Users/josh.ellis/code/react-spring`: delete `node_modules`, then run the full `quickstart.md` pipeline (`pnpm install --frozen-lockfile` → `pnpm build-ci` → `pnpm test:ts` → `pnpm test:unit` → `pnpm package` → `pnpm test:e2e`). Time each step and append the totals to `baseline.md` under "End-to-end pipeline (pnpm)". Compare against the yarn baseline captured in T001; assert the cold install + pipeline is ≤ 110% of the pre-migration wall-clock per SC-001.
- [ ] T064 After the PR has been open for at least three CI runs, inspect the GitHub Actions cache hit rate and warm-install timing on `actions/setup-node@v4` (`cache: 'pnpm'`). Record in `baseline.md` under "CI warm install (pnpm)" and verify ≤ the yarn warm install baseline per SC-003. If SC-003 fails, raise and either tune `pnpm-lock.yaml` cache key or accept and document the regression in the PR description.
- [ ] T065 Pre-merge cleanup: delete `/Users/josh.ellis/code/react-spring/specs/001-migrate-to-pnpm/baseline/` (the comparator tarballs) but keep `baseline.md` (the recorded measurements). The tarballs were transient; the measurements are the audit trail for SC-001 / SC-002 / SC-003 / SC-005.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 0 (Baseline, T001)**: No dependencies; MUST run on a clean `next` checkout BEFORE Phase 1 begins. Single task; no parallelism.
- **Phase 1 (Setup, T002–T004)**: Depends on Phase 0 complete. T002–T004 are independent of each other and can run in parallel.
- **Phase 2 (Foundational, T005–T027)**: Depends on Phase 1.
  - T005 (initial install + discovery) must complete first.
  - T006–T021 (phantom-dep fixes) can run **in parallel** after T005.
  - T022 (re-install) depends on T006–T021.
  - T023 (commit lockfile) depends on T022.
  - T024–T027 (delete yarn artefacts, update `.gitignore`) can run in parallel after T023.
- **Phase 3 (US1)**: Depends on Phase 2 complete.
- **Phase 4 (US2)**: Depends on Phase 2 complete. Can run in parallel with Phase 3 (different files) — though most teams will land Phase 3 first and push to CI to validate Phase 4.
- **Phase 5 (US3)**: Depends on Phase 3 complete (release flow requires working build + tests) AND Phase 0 complete (T059 diffs against T001's baseline tarballs).
- **Phase 6 (US4)**: Depends on Phase 2 complete. Can run in parallel with Phases 3, 4, 5.
- **Phase 7 (Polish)**: Depends on Phases 3, 4, 5, 6 complete. T064 specifically depends on CI runs accumulating (≥3); it can be addressed late in the PR cycle.

### Within-phase parallelism

- **Phase 1**: T002, T003, T004 — different files, parallel-safe.
- **Phase 2**: T006–T021 are all `[P]` — each touches a different workspace's `package.json`.
- **Phase 3**: T040 is `[P]` (touches only `docs/`); the rest run sequentially because they edit the root `package.json` and depend on the previous task's verification.
- **Phase 4**: T049–T053 are all `[P]` — each touches a different fixture directory.
- **Phase 7**: T061 is `[P]`.

### User-story dependencies

- US1 (P1) and US2 (P1) both depend on Foundational complete; they are mutually independent (different files).
- US3 (P2) depends on US1 (the release flow exercises the same scripts and build paths US1 verifies) AND on Phase 0 (T059 needs baseline tarballs to diff against).
- US4 (P3) depends on Foundational only.

---

## Implementation Strategy

### MVP first (US1 only)

1. Complete Phase 0: Baseline (T001) — record yarn-side measurements before anything changes.
2. Complete Phase 1: Setup (T002–T004).
3. Complete Phase 2: Foundational (T005–T027).
4. Complete Phase 3: US1 (T028–T040).
5. **STOP and VALIDATE**: contributor flow works on pnpm; everything builds, types, and tests locally.

At this point the repo is locally usable on pnpm. CI is still on yarn — but local development is fully migrated and the diff is intelligible for review.

### Incremental delivery

1. Phase 0 → MVP (US1) → push branch, open draft PR.
2. Add US2 (T041–T055) → CI goes green on pnpm.
3. Add US3 (T056–T059) → release flow verified short of actual publish; pack equivalence verified across every published workspace.
4. Add US4 (T060) → E2E verified.
5. Polish (T061–T065) → final sweep, warm-cache SC validation, baseline scaffolding torn down, squash and merge.

### Parallel team strategy

Realistically this migration is single-author work because the changes are highly inter-dependent (every phase touches the root `package.json` or CI). The places worth parallelising:

- Phase 2 phantom-dep fixes (T006–T021): can split across contributors if multiple people are pairing.
- Phase 4 fixture migrations (T049–T053): five identical-shape tasks, easy to split.

Everything else benefits more from a single mind holding the change in their head than from splitting it.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work.
- [Story] label maps each implementation task to its story for traceability against `spec.md`.
- "Phantom dep" tasks (T006–T021) may turn out to be no-ops for workspaces that already declared everything they import. The task still exists — completing it confirms "no missing declarations" was verified, not silently skipped.
- Commit after each logical group (Phase 0 → Phase 1 → Phase 2 → each user story). The history will be reviewable PR-by-task.
- Do NOT skip Husky hooks (`--no-verify`) at any point in this migration.
- If T022 surfaces a phantom dep that genuinely cannot be fixed (e.g. a third-party package that imports an undeclared peer), add a *targeted* `public-hoist-pattern[]=<exact-pkg>` to `.npmrc` and document it inline with the reason. Do NOT broaden to `public-hoist-pattern[]=*`.
- `baseline.md` and `specs/001-migrate-to-pnpm/baseline/<workspace>.tgz` are scratch artefacts produced by T001 and consumed by T033–T035, T055, T059, T063, and T064. The tarballs are deleted in T065; `baseline.md` survives the merge as the SC audit trail.
