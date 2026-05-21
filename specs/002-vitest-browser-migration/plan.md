# Implementation Plan: Migrate Test Infrastructure to Vitest Browser Mode

**Branch**: `002-vitest-browser-migration` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-vitest-browser-migration/spec.md`

## Summary

Replace Jest + jsdom + `@swc/jest` (unit) and Cypress (parallax E2E) with **Vitest** running in **browser mode** via the **Playwright provider** (Chromium). Keep the existing animation-testing helpers (`advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation`) and the in-tree `@react-spring/mock-raf` package unchanged in behaviour — only the surrounding runner globals (`jest.*` → `vi.*`) are swapped. Re-implement the single Cypress spec (`cypress/e2e/parallax.cy.ts`) as a Vitest browser E2E project that drives the existing Vite-served parallax fixture. Drop the visual snapshot assertions (`matchImageSnapshot`) per the spec's explicit out-of-scope assumption. Update CI to install Playwright Chromium and remove all Cypress steps and filters.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 22.15.0 (`.nvmrc`); CI matrix Node 20.x.

**Primary Dependencies**:

- **New (dev)**: `vitest`, `@vitest/browser`, `@vitest/coverage-v8`, `vitest-browser-react`, `playwright` (Chromium only).
- **Kept**: `@react-spring/mock-raf` (workspace), `flush-microtasks`.
- **Removed (dev)**: `jest`, `@swc/jest`, `@types/jest`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `cypress`, `@simonsmith/cypress-image-snapshot`, `@testing-library/cypress`, `start-server-and-test`. `act` is taken from `react` (React 19 native export).

**Storage**: N/A.

**Testing**:

- Vitest unit project(s) — browser mode, Playwright/Chromium, jsdom NOT used.
- Vitest E2E project — browser mode, navigates to the Vite-served `packages/parallax/test` fixture.
- `tsc --noEmit` unchanged (`pnpm test:ts`).

**Target Platform**: Linux/macOS contributor laptops; GitHub Actions Ubuntu runners.

**Project Type**: Library monorepo (Turborepo + pnpm workspaces).

**Performance Goals**:

- Clean install + full test run ≤ 1.5× current Jest + Cypress wall-clock (SC-005).
- Watch-mode first results < 10 s on a contributor machine (SC-006).
- CI unit+E2E job time ≤ today's combined unit+E2E (SC-007).

**Constraints**:

- Helpers MUST remain deterministic via fake timers + `@react-spring/mock-raf`; tests MUST NOT depend on real rAF cadence.
- Coverage thresholds floor: 80% statements / 74% branches / 71% functions / 82% lines (SC-004).
- Public API surface of the library: **unchanged**. This is purely a dev-tooling change.

**Scale/Scope**:

- ~16 test files across `packages/{core,shared,rafz}` and `targets/web` (per inventory).
- 5 `.native.ts(x)` files — excluded from the browser project.
- 1 Cypress spec to re-port; 1 Vite fixture reused as-is.
- 1 GitHub Actions workflow file (`tests.yml`) to update.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle / Gate                                                                           | Status     | Notes                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------ | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I. Layered Architecture**                                                                | ✅ Pass    | No source-code layering changes.                                                                                                                                                                                                                                  |
| **II. Target-Agnostic Core**                                                               | ✅ Pass    | No core source changes; only `test/setup.ts` is touched in `packages/core`.                                                                                                                                                                                       |
| **III. Test-First Animation Behaviour**                                                    | ✅ Pass    | Helpers (`advance`, etc.) preserved with identical signatures and identical determinism contract. Setup file ported, not deleted. `mock-raf` retained.                                                                                                            |
| **IV. Version-Locked, Changeset-Driven Releases**                                          | ✅ Pass    | No published-package runtime change. devDependency churn does not require a changeset.                                                                                                                                                                            |
| **V. Performance Discipline on Hot Path**                                                  | ✅ Pass    | No `rafz` / `FrameLoop` code edits.                                                                                                                                                                                                                               |
| **Quality Gates §1**: "`pnpm test:unit` — **Jest** unit tests pass."                       | ⚠️ Tension | Constitution text names Jest by tool. After migration the runner is Vitest; the _intent_ (unit tests pass with the same coverage floor) is unchanged. Requires a **PATCH** constitution amendment (wording, no principle change). Tracked in Complexity Tracking. |
| **Quality Gates §2**: "**Cypress** E2E (`pnpm test:e2e`) covers `@react-spring/parallax`…" | ⚠️ Tension | Cypress removed by design. The `pnpm test:e2e` script and intent (parallax E2E coverage) are preserved — only the runner changes. Same **PATCH** amendment as above. Tracked in Complexity Tracking.                                                              |

**Verdict**: PASS with two wording-level constitution amendments queued (no principle change). Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-vitest-browser-migration/
├── plan.md              # This file
├── research.md          # Phase 0 — runner/provider/timer-strategy decisions
├── data-model.md        # Phase 1 — test-infra entities (runner config, projects, helpers)
├── quickstart.md        # Phase 1 — contributor commands cheat-sheet
├── contracts/
│   └── test-helpers.md  # Phase 1 — frozen public contract for `advance`/`advanceUntil`/...
└── checklists/
    └── requirements.md  # From /speckit-specify
```

### Source Code (repository root)

```text
react-spring/
├── vitest.config.ts                  # NEW — root config: defines "unit" and "e2e" projects
├── packages/
│   ├── core/
│   │   └── test/
│   │       └── setup.ts              # EDITED — jest.* → vi.*; act from 'react'; keep helpers identical
│   ├── mock-raf/                     # UNCHANGED — already in-tree (commit c31e03e7)
│   ├── core/src/**/*.test.ts(x)      # IMPORTS UPDATED — render/renderHook swap; jest.* → vi.*
│   ├── shared/src/**/*.test.ts       # IMPORTS UPDATED
│   ├── rafz/src/index.test.ts        # IMPORTS UPDATED
│   └── parallax/test/                # UNCHANGED — Vite fixture reused as-is for E2E
├── targets/
│   └── web/src/animated.test.tsx     # IMPORTS UPDATED
├── tests/
│   ├── helpers/
│   │   └── render.tsx                # NEW — RTL-style query compat for animated.test.tsx
│   └── e2e/
│       ├── global-setup.ts           # NEW — programmatic Vite createServer + provide('baseUrl', …)
│       └── parallax.spec.ts          # NEW — re-port of cypress/e2e/parallax.cy.ts (behavioural only)
├── cypress/                          # DELETED
├── cypress.config.ts                 # DELETED
├── jest.config.js                    # DELETED
├── package.json                      # EDITED — scripts + devDependencies
└── .github/workflows/tests.yml       # EDITED — install playwright, drop cypress filter, restore E2E job
```

**Structure Decision**: Single root Vitest config defining **two projects** (`unit` and `e2e`) is preferred over per-package configs to mirror the current single `jest.config.js` ergonomics and to centralise the `@react-spring/*` → `packages/*/src/index.ts` alias map. The new `tests/e2e/` folder lives at the repo root (not in `cypress/`) so it is unambiguous that Cypress is gone.

## Complexity Tracking

| Violation                                                                                   | Why Needed                                                                                                                                                     | Simpler Alternative Rejected Because                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Constitution PATCH amendment for Quality Gates §1 (rename "Jest" → "Vitest")                | The constitution names the runner explicitly. Migration changes the runner.                                                                                    | "Leave the wording" — would leave an untrue statement in a load-bearing governance doc. Cost is one PR with a wording-only PATCH bump.                                                                                                                               |
| Constitution PATCH amendment for Quality Gates §2 (rename "Cypress" → "Vitest browser E2E") | Same — Cypress is named explicitly.                                                                                                                            | "Leave the wording" — same reason. Bundled into the same PATCH amendment PR.                                                                                                                                                                                         |
| Dropping `matchImageSnapshot` visual snapshots from the parallax E2E                        | Spec explicitly puts visual regression out of scope; Vitest browser does not ship a first-class image-snapshot matcher equivalent to `cypress-image-snapshot`. | "Keep snapshots" — would require either retaining a parallel Playwright Test install or building a custom screenshot+diff pipeline. Either undermines the "single runner" goal. Behavioural assertions (transform values, position, sticky behaviour) are preserved. |

---

## Phase 0 — Research (output: `research.md`)

Decisions to lock down before any code change:

1. **Runner choice**: Vitest vs. Web Test Runner vs. Playwright Test vs. Jest-with-Playwright.
2. **Provider choice**: `@vitest/browser` Playwright provider vs. Webdriver vs. Preview.
3. **Timer strategy**: how to keep `mock-raf`-driven determinism inside a real browser (fake timers + manual `mockRaf.step()` flow).
4. **Module resolution**: replicating `moduleNameMapper` (`^@react-spring/(.*)` → `packages/$1/src/index.ts`) with `resolve.alias`.
5. **Coverage**: `@vitest/coverage-v8` configuration to enforce existing thresholds and the existing `collectCoverageFrom` glob.
6. **React Native exclusion**: glob pattern that mirrors Jest's `testPathIgnorePatterns` plus excluding `*.native.ts(x)` from the browser project.
7. **E2E orchestration**: how Vitest spins up the Vite parallax fixture (Vitest browser can drive arbitrary URLs; we keep the existing Vite serve in a sidecar process or via Vitest's `setup` hook).
8. **`jest-dom` matchers**: replace `@testing-library/jest-dom` with `@vitest/expect` or keep it (it supports both — verify version).
9. **CI install footprint**: Playwright Chromium download size and cache strategy on Actions runners.

Each item in `research.md` follows the template:

- **Decision** — chosen approach.
- **Rationale** — why.
- **Alternatives considered** — what else was looked at and rejected.

Producing the file is part of this command's output below.

## Phase 1 — Design Artifacts

1. **`data-model.md`** — captures the test-infra entities:

   - `RunnerConfig` (root `vitest.config.ts`) with two `projects`: `unit`, `e2e`.
   - `SetupModule` (`packages/core/test/setup.ts`, referenced directly from `setupFiles`) — fields: `beforeEach reset list`, `helper globals`, `Globals.assign payload`.
   - `TestHelpers` — the public contract (see contracts/).
   - `E2EFixture` — the Vite-served `packages/parallax/test` app.
   - `CIPipeline` — workflow steps the migration touches.

2. **`contracts/test-helpers.md`** — frozen public contract for the helpers. This is the single most important guard against regressions: every helper's signature, semantics, and reset behaviour is documented here so a reviewer can verify the migrated `setup.ts` against it.

3. **`quickstart.md`** — contributor-facing cheat sheet: run all unit tests, run a single file, filter by name, watch mode, coverage, headed debugging, run only the E2E project.

4. **Agent context update** — point CLAUDE.md's SPECKIT block to this plan.

---

## Execution checklist (this plan, end-to-end)

The full plan is broken into work-items below. `/speckit-tasks` will turn these into an ordered tasks.md. Listed here so reviewers can see the shape.

### Work items

- **W1 — Add Vitest toolchain** (no behaviour change yet)

  - Add `vitest`, `@vitest/browser`, `@vitest/coverage-v8`, `vitest-browser-react`, `playwright` to root `devDependencies`.
  - Create `vitest.config.ts` with `unit` project: browser mode, Playwright/Chromium, alias map, `setupFiles: ['./packages/core/test/setup.ts']` (referenced directly — no separate root shim), coverage thresholds.
  - Verify `pnpm vitest run` boots Chromium and discovers zero tests yet.

- **W2 — Port setup file**

  - In `packages/core/test/setup.ts`: replace `jest.setTimeout(6e8)` → `vi.setConfig({ testTimeout: 6e8 })`; `jest.advanceTimersByTimeAsync` → `vi.advanceTimersByTimeAsync`; `beforeEach`/`afterEach` from `vitest`; `import { act } from '@testing-library/react'` → `import { act } from 'react'`. Keep `mockRaf`, `Globals.assign`, frame observers byte-for-byte equivalent.
  - Enable Vitest fake timers globally in config (`fakeTimers: { toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'] }` — explicitly _not_ faking `requestAnimationFrame` since `mock-raf` owns it).

- **W3 — Migrate unit tests**

  - Search-and-replace `jest.fn` / `jest.mock` / `jest.spyOn` → `vi.fn` / `vi.mock` / `vi.spyOn` across `packages/**/*.test.ts(x)` and `targets/**/*.test.tsx`.
  - Add `import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'` only where files relied on Jest globals not exposed by Vitest's default globals.
  - **Swap `@testing-library/react` → `vitest-browser-react`** at every call site (8 files total). Concretely:
    - `import { render, RenderResult } from '@testing-library/react'` → `import { render } from 'vitest-browser-react'`. The `RenderResult` type is dropped; the new return shape is `{ container, baseElement, rerender, unmount }` plus locator helpers — tests destructure only the fields they actually use.
    - `import { renderHook } from '@testing-library/react'` (used in `useSpringValue.test.ts`, `useReducedMotion.test.ts`) → `import { renderHook } from 'vitest-browser-react'`. `vitest-browser-react` 0.1.1+ ships `renderHook` natively with a Testing-Library-compatible signature, so no in-repo shim is needed.
    - `import { act } from '@testing-library/react'` (in `useReducedMotion.test.ts` and the setup file) → `import { act } from 'react'` (React 19 native).
    - Drop `import '@testing-library/jest-dom'` (one occurrence, `useTransition.test.tsx`); replace any `toBeInTheDocument()`-style matchers with locator-based assertions (`expect.element(locator).toBeInTheDocument()` via `@vitest/browser/context`, or direct DOM assertions). Audit during W3.
  - Run `pnpm vitest run` — fix any divergence.

- **W4 — Re-implement parallax E2E**

  - Create `tests/e2e/parallax.spec.ts` using Vitest browser + `@vitest/browser/context` (`page`, `userEvent`).
  - Translate each `cy.findByTestId` → `screen.getByTestId` / `page.getByTestId`; `cy.scrollTo` → element scroll via `evaluate`; `cy.wait(4000)` → explicit `waitFor` on the transform value rather than wall-clock.
  - Drop `matchImageSnapshot` calls (out of scope per spec).
  - Wire the Vite fixture: `vitest.config.ts`'s `e2e` project gets a `setupFiles` that starts the Vite dev server on a free port and exposes `BASE_URL`, or use Vitest's `serve` integration directly.

- **W5 — Coverage**

  - Configure `@vitest/coverage-v8` with the same `collectCoverageFrom` globs and thresholds.
  - Add `test:cov` script: `vitest run --coverage`.
  - Verify thresholds still pass.

- **W6 — Scripts and removals**

  - `package.json`: `test:unit` → `vitest run --project unit`; `test:e2e` → `vitest run --project e2e`; `test:cov` → `vitest run --coverage --project unit`; keep `test` aggregate.
  - Remove `jest`, `@swc/jest`, `@types/jest`, `cypress`, `@simonsmith/cypress-image-snapshot`, `@testing-library/cypress`, `start-server-and-test` from devDependencies.
  - Delete `jest.config.js`, `cypress.config.ts`, `cypress/`.
  - Run `pnpm install` to update the lockfile.

- **W7 — CI**

  - `.github/workflows/tests.yml`:
    - Drop `cypress/**` from the path filter.
    - In `test-unit`, add a step before `pnpm test:unit`: `pnpm exec playwright install --with-deps chromium` (cached via `~/.cache/ms-playwright`).
    - Uncomment and rewrite the `test-e2e` job to install Playwright + run `pnpm test:e2e` (no separate Vite step — handled inside the Vitest E2E project).
  - Verify the Node 18.x publish-CI matrix still works (Vitest 2.x supports Node 18; confirm in research).

- **W8 — Docs & constitution**
  - Update `CLAUDE.md` Testing model section to reference Vitest, the new commands, and the new setup file location.
  - Open a follow-up PR (or include in this one — TBD with maintainer) bumping the constitution to **1.0.1 (PATCH)** with the Jest/Cypress → Vitest wording change in the Quality Gates section.

### Re-evaluation of Constitution Check post-design

After Phase 1 artifacts (data-model.md, contracts/test-helpers.md, quickstart.md), re-check:

- Principle III: contract for helpers is now written down explicitly (`contracts/test-helpers.md`); the setup-file port can be reviewed against it line-by-line. ✅ Strengthened.
- All other principles: unchanged from initial check. ✅

**Final Verdict**: PASS. Proceed to `/speckit-tasks`.
