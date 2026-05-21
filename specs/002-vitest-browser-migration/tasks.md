---
description: 'Task list for Vitest browser migration'
---

# Tasks: Migrate Test Infrastructure to Vitest Browser Mode

**Input**: Design documents from `/specs/002-vitest-browser-migration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-helpers.md, quickstart.md

**Tests**: This feature _is_ a test-infrastructure migration. Tests in the traditional sense (red-green-refactor) do not apply; instead, the existing test suite _is_ the acceptance test — every task is validated by running the suite and confirming the previous Jest pass count is preserved.

**Organization**: Tasks are grouped by the three user stories in spec.md (US1 = real-browser unit suite, US2 = consolidated E2E, US3 = helper-API preservation). US1 and US3 share the same runner config and are scoped together because US3 is structurally a subset of US1 (preserving the helpers _while_ moving the runner).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are absolute or repo-rooted

## Path Conventions

Repo root: `/Users/josh.ellis/code/react-spring/`. Paths below are repo-rooted.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add the new toolchain. No tests run yet, no removals.

- [ ] T001 Add devDependencies in `package.json`: `vitest`, `@vitest/browser`, `@vitest/coverage-v8`, `vitest-browser-react`, `playwright`. Run `pnpm install` and commit the lockfile change.
- [ ] T002 Install Chromium binary once locally: run `pnpm exec playwright install chromium` (no file change; documents the contributor step).
- [ ] T003 Create `vitest.config.ts` at repo root per `data-model.md` §RunnerConfig with the `unit` and `e2e` projects, alias map, fakeTimers config, coverage config, and `setupFiles: ['./packages/core/test/setup.ts']` for the `unit` project (no separate root shim). Also include the typed `ProvidedContext` `declare module 'vitest'` block (see `research.md` §R7) so the E2E spec can `inject('baseUrl')` with types.
- [ ] T004 _REMOVED — collapsed into T003. The root `vitest.setup.ts` shim is no longer needed; `setupFiles` references `packages/core/test/setup.ts` directly._
- [ ] T005 [P] Create `tests/helpers/renderHook.tsx` per `research.md` §R8 (the 15-line probe-component shim returning `{ result, rerender, unmount }`).
- [ ] T006 [P] Create `tests/e2e/` directory with a placeholder `.gitkeep` so subsequent tasks have a stable location.

**Checkpoint**: `pnpm vitest run --project unit` boots Chromium and discovers zero tests (because no tests are migrated yet). This proves the runner is wired up.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Port the setup file so the helpers exist in the new runner. Without this, no test in any user story can run.

**⚠️ CRITICAL**: Phase 3 (US1/US3) is fully blocked on this phase.

- [ ] T007 In `packages/core/test/setup.ts`: replace `jest.setTimeout(6e8)` → `vi.setConfig({ testTimeout: 6e8 })`; `jest.advanceTimersByTimeAsync(1000/60)` → `vi.advanceTimersByTimeAsync(1000/60)`; add `import { beforeEach, afterEach, vi } from 'vitest'`; `import { act } from '@testing-library/react'` → `import { act } from 'react'`. Verify against `contracts/test-helpers.md` "Acceptance checks for the ported `setup.ts`" — every "Verified?" row ticked.
- [ ] T008 Verify the eight helper globals (`mockRaf`, `advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation`) are still attached to `globalThis` after the rename. Sanity-check: `pnpm vitest run packages/rafz/src/index.test.ts` (smallest test file, fewest dependencies) — must pass.

**Checkpoint**: Helpers work under Vitest. We can now migrate the rest of the suite.

---

## Phase 3: User Story 1 + User Story 3 — Real-browser unit suite with helpers preserved (Priority: P1) 🎯 MVP

**Goal**: Every existing Jest unit test passes under Vitest browser mode, with helper call sites untouched.

**Independent Test**: Run `pnpm vitest run --project unit`. The pass count equals the current `pnpm test:unit` pass count on `next`. No test bodies were rewritten — only imports.

### Implementation for US1/US3

- [ ] T009 [P] [US1] Update imports in `packages/core/src/SpringContext.test.tsx`: `@testing-library/react` → `vitest-browser-react`. Drop `RenderResult` type. Switch any `jest.*` calls to `vi.*`.
- [ ] T010 [P] [US1] Update imports in `packages/core/src/hooks/useSpring.test.tsx`: same swap as T009.
- [ ] T011 [P] [US1] Update imports in `packages/core/src/hooks/useSprings.test.tsx`: same swap as T009.
- [ ] T012 [P] [US1] Update imports in `packages/core/src/hooks/useTrail.test.tsx`: same swap as T009.
- [ ] T013 [P] [US1] Update imports + matchers in `packages/core/src/hooks/useTransition.test.tsx`: drop `@testing-library/jest-dom` line; swap `@testing-library/react` → `vitest-browser-react`; rewrite any `.toBeInTheDocument()` / `.toHaveStyle()` etc. as `expect.element(locator).toBeInTheDocument()` via `@vitest/browser/context`.
- [ ] T014 [P] [US1] Update imports in `packages/core/src/hooks/useSpringValue.test.ts`: `renderHook` from `@testing-library/react` → `tests/helpers/renderHook`.
- [ ] T015 [P] [US1] Update imports in `packages/shared/src/hooks/useReducedMotion.test.ts`: `act` → from `react`; `renderHook` → from `tests/helpers/renderHook`.
- [ ] T016 [P] [US1] Update imports in `targets/web/src/animated.test.tsx`: `@testing-library/react` → `vitest-browser-react`.
- [ ] T017 [P] [US1] Sweep `jest.*` → `vi.*` in pure-logic test files (no rendering): `packages/core/src/{Controller,interpolate,AnimationConfig,SpringValue,Interpolation,helpers}.test.ts`, `packages/core/src/hooks/useSpringValue.test.ts` (mocks only), `packages/shared/src/createInterpolator.test.ts`, `packages/shared/src/hooks/useReducedMotion.test.ts` (mocks only), `packages/rafz/src/index.test.ts`. Add `import { ... } from 'vitest'` only where Jest globals were used implicitly that Vitest does not auto-expose with `globals: true`.
- [ ] T018 [US3] Run `pnpm vitest run --project unit` end-to-end. Fix any divergence (snapshot serialisation, async timing edge cases). Target: same pass count as the current `pnpm test:unit` on `next` (SC-001).
- [ ] T019 [US1] Wire `pnpm test:cov` to `vitest run --project unit --coverage` in `package.json`. Run it. Confirm thresholds (80/74/71/82) all pass (SC-004). If coverage dropped because V8 reports differently from `@swc/jest`, adjust includes in `vitest.config.ts` to match the previous `collectCoverageFrom` exactly before considering threshold tweaks.

**Checkpoint**: MVP done. Unit suite runs in Chromium; helpers preserved; coverage floor holds.

---

## Phase 4: User Story 2 — Parallax E2E in the same runner (Priority: P2)

**Goal**: The behaviours currently asserted by `cypress/e2e/parallax.cy.ts` are re-asserted by a new Vitest browser E2E spec against the same Vite-served fixture. Cypress is fully removed.

**Independent Test**: Run `pnpm test:e2e`. The new spec navigates the parallax fixture, asserts scroll positions / layer transforms / sticky behaviour, and exits 0. `grep -ri "cypress" .` from repo root (excluding `node_modules`) returns no source-code hits.

### Implementation for US2

- [ ] T020 [P] [US2] Create `tests/e2e/global-setup.ts` per `research.md` §R7: programmatic Vite `createServer({ root: 'packages/parallax/test', server: { port: 0 } })`, then `provide('baseUrl', `http://localhost:${port}`)` (typed via the `ProvidedContext` declaration added in T003); export a `teardown` function that calls `server.close()`. **Do not** set `process.env.BASE_URL` — the browser-side test cannot read Node env vars.
- [ ] T021 [US2] Create `tests/e2e/parallax.spec.ts` by porting the assertions from `cypress/e2e/parallax.cy.ts`:
  - At the top of the file: `import { inject } from 'vitest'`; `import { page } from '@vitest/browser/context'`; `const baseUrl = inject('baseUrl')`. In `beforeEach`: `await page.goto(`${baseUrl}/vertical`)`.
  - Translate `cy.findByTestId('container')` → `page.getByTestId('container')`.
  - Translate `cy.findByTestId('default-layer').then(layer => layer[0].style.transform).then(transform => expect(transform).to.equal(...))` → `expect(await page.getByTestId('default-layer').evaluate(el => el.style.transform)).toBe(...)`.
  - Translate `cy.findByTestId('container').scrollTo(0, HEIGHT)` → `await page.getByTestId('container').evaluate((el, h) => el.scrollTo(0, h), HEIGHT)`.
  - Replace `cy.wait(4000)` with `await expect.poll(() => page.getByTestId(id).evaluate(el => el.style.transform)).toBe(expected)` (no wall-clock waits).
  - **Drop** all `matchImageSnapshot(...)` calls per spec assumption (out of scope).
- [ ] T022 [US2] Run `pnpm vitest run --project e2e` locally. Iterate until every previously-Cypress-asserted behaviour passes (SC-002).
- [ ] T023 [US2] Delete `cypress/` directory, `cypress.config.ts`, and `cypress/screenshots`/`cypress/snapshots` if not removed by the directory deletion. Verify `grep -ri 'cypress\|Cypress\|cy\.' . --exclude-dir=node_modules --exclude-dir=.git` returns no source-code hits (SC-003).
- [ ] T024 [US2] Remove devDependencies from `package.json`: `cypress`, `@simonsmith/cypress-image-snapshot`, `@testing-library/cypress`, `start-server-and-test`. Run `pnpm install`.

**Checkpoint**: Parallax E2E runs in the same runner. Cypress is gone.

---

## Phase 5: Final cleanup — remove Jest/Testing Library, update scripts, CI, and docs

**Purpose**: Now that everything green passes under Vitest, remove the old toolchain and rewire CI.

- [ ] T025 [P] Delete `jest.config.js` at repo root.
- [ ] T026 [P] Remove devDependencies from `package.json`: `jest`, `@swc/jest`, `@types/jest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`. Run `pnpm install`.
- [ ] T027 Update `package.json` scripts:
  - `test:unit` → `vitest run --project unit`
  - `test:cov` → `vitest run --project unit --coverage`
  - `test:e2e` → `vitest run --project e2e`
  - `test` → `pnpm test:ts && pnpm test:unit && pnpm test:e2e` (unchanged shape; only sub-commands changed).
  - Remove `postinstall` if it only existed for Cypress / remix-related Cypress dep (audit and leave Remix's setup line untouched).
- [ ] T028 Update `.github/workflows/tests.yml`:
  - In the `changes` filter, remove `cypress/**`.
  - In `test-unit` job, before the `Test` step add:
    - `Cache Playwright browsers` step (`actions/cache@v4`, path `~/.cache/ms-playwright`, key `playwright-chromium-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}`).
    - `Install Playwright Chromium` step running `pnpm exec playwright install --with-deps chromium`.
  - Uncomment the `test-e2e` job, rewrite its `Test` step to `pnpm test:e2e`, and add the same Playwright cache + install steps. Drop the `Build` step in `test-e2e` if E2E doesn't need built packages (the fixture is served from source via Vite).
- [ ] T029 [P] Update `CLAUDE.md` "Stack" and "Testing model" sections: rename Jest → Vitest, jsdom → Chromium/Playwright, remove `@swc/jest`, point to `vitest.config.ts` and the new commands. Mirror the table from `quickstart.md` "Day-to-day commands".
- [ ] T030 Bump the constitution to **1.0.1** in `.specify/memory/constitution.md`: in the Quality Gates section, rename "Jest unit tests pass" → "Vitest unit tests pass (browser mode, Chromium via Playwright)" and rename the Cypress E2E paragraph to reference Vitest browser. Prepend a Sync Impact Report comment block noting the PATCH bump and that no principle changed. Update `Last Amended` date. **Must land in the same PR as T025–T029** — the constitution must not lag the code change on `next`.

**Checkpoint**: `pnpm test` is green end-to-end (types + unit + E2E), CI passes, constitution and CLAUDE.md are accurate.

---

## Phase 6: Polish & Cross-Cutting

- [ ] T031 [P] Capture wall-clock numbers for SC-005 (full test run vs. pre-migration baseline), SC-006 (watch-mode first-results), SC-007 (CI total). Add them to the PR description.
- [ ] T032 [P] Audit for stray `RenderResult`, `screen`, `fireEvent`, `userEvent` (from `@testing-library/*`) imports across `packages/` and `targets/`. Replace or remove.
- [ ] T033 [P] Audit `pnpm` workspace dependencies: confirm no published package's `package.json` lists `jest`, `cypress`, or `@testing-library/*` (these should only have ever been root devDependencies; flag if any leaked).
- [ ] T034 Update PR description with: migration summary, link to `quickstart.md`, constitution amendment note, and the SC-005/006/007 numbers from T031.

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: no dependencies; can start immediately.
- **Phase 2 (Foundational)**: depends on Phase 1 complete.
- **Phase 3 (US1+US3)**: depends on Phase 2 complete. This is the MVP.
- **Phase 4 (US2)**: depends on Phase 3 complete (the runner config used by E2E is verified by US1 first; E2E removal in Phase 4 must not stall US1 if US1 fails).
- **Phase 5 (Cleanup/CI)**: depends on **both** Phase 3 and Phase 4 green. Removing Jest before Phase 3 would brick the suite; removing Cypress before Phase 4 would brick the E2E.
- **Phase 6 (Polish)**: depends on Phase 5.

### Within Phase 3

- T009–T017 are all `[P]` — different files, no inter-task ordering.
- T018 depends on T007, T008, and T009–T017 (it runs the whole suite).
- T019 depends on T018.

### Within Phase 4

- T020 and T021 can overlap but T021 needs T020's `provide('baseUrl', …)` call to be present (and the typed `ProvidedContext` declaration added in T003).
- T022 depends on T020 + T021.
- T023 + T024 depend on T022 (don't delete Cypress until the new E2E is proven green).

### Within Phase 5

- T025 + T026 are `[P]` (different files).
- T027 depends on T025 + T026 (script names refer to the new tools only).
- T028 depends on T027 (CI calls `pnpm test:e2e` whose definition just changed).
- T029 + T030 are `[P]` with each other but logically depend on T028 (don't claim "CI uses Vitest" in docs until the workflow change is real).

### Parallel opportunities

- All Phase 3 import-swap tasks (T009–T017) can be assigned to different people / sessions.
- T020 (E2E global setup) and Phase 3 import sweeps can be done in parallel by separate workers — they touch disjoint files.
- T029 (CLAUDE.md) and T030 (constitution) can be drafted in parallel since they update different files.

---

## Parallel Example: Phase 3 (the import sweep)

```bash
# Eight independent edits — different files, no ordering:
Task: "T009 Update imports in packages/core/src/SpringContext.test.tsx"
Task: "T010 Update imports in packages/core/src/hooks/useSpring.test.tsx"
Task: "T011 Update imports in packages/core/src/hooks/useSprings.test.tsx"
Task: "T012 Update imports in packages/core/src/hooks/useTrail.test.tsx"
Task: "T013 Update imports + matchers in packages/core/src/hooks/useTransition.test.tsx"
Task: "T014 Update imports in packages/core/src/hooks/useSpringValue.test.ts"
Task: "T015 Update imports in packages/shared/src/hooks/useReducedMotion.test.ts"
Task: "T016 Update imports in targets/web/src/animated.test.tsx"
Task: "T017 Sweep jest.* → vi.* in pure-logic test files (8 files)"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 (toolchain installed, configs in place).
2. Complete Phase 2 (helpers ported).
3. Complete Phase 3 (unit suite green). **This is the MVP** — already delivers the primary user value: real-browser unit tests with helpers preserved.
4. **STOP and validate**: run `pnpm test:unit` + `pnpm test:cov`. Confirm SC-001 and SC-004 hold. Demo / merge as a stacked first PR if desired.

### Incremental delivery (recommended stacking)

1. **PR 1**: Phases 1 + 2 + 3 + the `test:unit` / `test:cov` script changes only. CI still runs the old Cypress path (now gated by paths that no longer match — fine). Validates US1+US3.
2. **PR 2**: Phase 4 + Phase 5 + Phase 6 (Cypress removal, Jest removal, CI rewrite, **constitution PATCH bump in the same PR**, and the SC-005/006/007 measurements). The constitution must not lag the code change on `next`, so T030 lands here — not as a follow-up.

(If maintainer prefers single-PR delivery, collapse to one PR — the phase boundaries still serve as commit boundaries.)

### Parallel team strategy

Two contributors:

- **A**: Phases 1–3 (the bulk of the migration).
- **B**: Phase 4 (parallax E2E re-port) — can start in parallel once T003 (root `vitest.config.ts`) is in place; the E2E project config is independent of the unit project config.

---

## Notes

- `[P]` = different files, no inter-task dependencies.
- Every Phase 3 import swap is mechanical — a senior could do them in ~30 min total.
- Phase 5's CI step (T028) is the highest-risk task because it's the only place we can't validate locally. Test by pushing to a draft PR after T028 and watching the workflow run.
- T030 (constitution PATCH bump) lands **in the same PR as Phases 4–5**, not as a follow-up — the governance doc must not contradict the code on `next` even briefly.
- Commit after each task group, following Conventional Commits. Suggested commit messages:
  - Phase 1: `chore(test): add vitest browser toolchain`
  - Phase 2: `chore(test): port setup.ts to vitest`
  - Phase 3: `chore(test): migrate unit tests to vitest-browser-react`
  - Phase 4: `chore(test): replace cypress with vitest browser e2e`
  - Phase 5: `chore(test): remove jest and testing-library; update ci`
  - Phase 6: `docs: update CLAUDE.md and constitution for vitest migration`
