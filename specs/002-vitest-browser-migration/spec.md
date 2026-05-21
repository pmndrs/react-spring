# Feature Specification: Migrate Test Infrastructure to Vitest Browser Mode

**Feature Branch**: `002-vitest-browser-migration`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "we're using jest for tests, this is an animation library if im honest we should be using vitest browser because it uses playwright under the hood, we could also remove cypress form the picture if we do this i believe."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Run the unit test suite in a real browser (Priority: P1)

As a maintainer of an animation library, I need the unit test suite to run inside a real browser environment so that animation timing, DOM measurements, layout effects, and platform-specific APIs (rAF, ResizeObserver, IntersectionObserver, scroll, transforms) are exercised against the same primitives end users experience — not a jsdom approximation.

**Why this priority**: This is the core motivation for the migration. The current jsdom-based suite cannot faithfully validate the very behaviours an animation library is responsible for (frame scheduling, style application, layout reads). Without this slice, the migration has no value.

**Independent Test**: Can be fully validated by running the migrated unit test suite for `@react-spring/core`, `@react-spring/shared`, `@react-spring/animated`, and the web target inside a real browser provider, observing all current passing tests remain green, and confirming tests now execute against real DOM/CSSOM APIs.

**Acceptance Scenarios**:

1. **Given** a contributor has cloned the repository, **When** they run the unit test command, **Then** the suite executes in a headless real browser and reports the same or better pass count as the previous Jest suite.
2. **Given** a contributor adds a test that asserts on a computed style or a real `requestAnimationFrame` tick, **When** they run the suite, **Then** the assertion is evaluated against the browser's real implementations rather than a jsdom shim.
3. **Given** the suite is run in CI, **When** the job completes, **Then** test results, failure messages, and stack traces are surfaced with line/column accuracy comparable to or better than the existing Jest output.

---

### User Story 2 - Consolidate E2E (parallax) coverage into the same runner (Priority: P2)

As a maintainer, I want the existing parallax end-to-end scenarios to run under the same browser-based test runner as the unit suite, so that the project no longer needs a separate Cypress toolchain, configuration, and CI job.

**Why this priority**: Cypress is currently used only for the parallax package's E2E tests. Consolidating onto a single runner removes a dependency, a config surface, and a CI pathway — but it depends on Story 1 being in place first, and the existing Cypress coverage is small (one spec file) so it is lower risk and lower value than the core migration.

**Independent Test**: Can be validated by removing Cypress from the project, re-implementing the existing `cypress/e2e/parallax.cy.ts` scenarios under the new runner against the same Vite-served parallax test app, and confirming each previously-asserted behaviour (scroll position, layer offsets, sticky behaviour, etc.) still passes.

**Acceptance Scenarios**:

1. **Given** the parallax test fixture is served, **When** the new browser-based E2E spec runs, **Then** every assertion previously made by the Cypress spec is re-evaluated and passes.
2. **Given** Cypress has been removed from the repository, **When** a contributor runs the project's full test command, **Then** parallax E2E scenarios run as part of that command without a separate Cypress installation step.
3. **Given** CI runs the consolidated suite, **When** the parallax E2E job completes, **Then** the previous standalone Cypress job is no longer required and is removed from the pipeline configuration.

---

### User Story 3 - Preserve the animation-testing helper API (Priority: P1)

As a contributor writing animation tests, I rely on the existing test helpers (`advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation`) being available in tests so that I can drive the spring engine deterministically without rewriting hundreds of tests.

**Why this priority**: The existing test suite is large and these helpers are used pervasively. If the migration breaks the helper contract, the project effectively has to rewrite the test suite, which is unacceptable scope. Helpers must work identically (deterministic frame stepping) in the new runner.

**Independent Test**: Can be validated by running the existing tests that exercise these helpers (e.g., `SpringValue.test.ts`, `Controller.test.ts`, `useSpring.test.tsx`) under the new runner and confirming they pass without modification to the helper call sites.

**Acceptance Scenarios**:

1. **Given** a test calls `advance(5)`, **When** the test runs under the new runner, **Then** exactly five animation frames are processed deterministically before the next assertion runs.
2. **Given** a test calls `advanceUntilValue(spring, 1)`, **When** the spring reaches or passes the target value, **Then** control returns to the test without relying on real wall-clock time.
3. **Given** the rAF scheduler is reset between tests, **When** a new test begins, **Then** no frames or timers leak from the previous test.

---

### Edge Cases

- **Determinism vs. real browser timing**: real browsers drive rAF off the display refresh, but animation tests must remain deterministic. The frame helpers MUST continue to step time on demand without depending on the browser's real frame cadence.
- **React Native tests**: the suite currently includes tests for hooks with `.native.ts` variants. The new runner does not need to execute these in a browser, but they MUST continue to type-check and any pure-logic native tests MUST still be runnable.
- **Watch mode for the dev loop**: contributors rely on a fast feedback loop. Browser-mode tests can be slower to start than jsdom; watch mode MUST remain usable for day-to-day work.
- **Coverage reporting**: the project currently enforces coverage thresholds (80/74/71/82). Coverage MUST still be collected and the same or stricter thresholds enforced after migration.
- **CI Node version matrix**: CI currently runs Node 18/20. The new runner MUST be compatible with the Node versions CI uses (or the matrix MUST be updated as part of this work).
- **Headed debugging**: contributors should be able to run a single failing test with the browser visible to inspect the DOM at the moment of failure.
- **Mock-raf removal**: the project recently absorbed `mock-raf` (commit `c31e03e7`). The new setup MUST replace its role with a browser-compatible deterministic rAF mechanism — likely a fake-timers integration or the existing `rafz` test hooks.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The unit test suite for all workspace packages MUST run inside a real browser environment driven by Playwright as the underlying browser automation layer.
- **FR-002**: The test runner MUST be invoked through a single top-level command that replaces the current `yarn test:unit` entry point, and the project's existing aggregate test command MUST continue to work end-to-end (types + unit + E2E).
- **FR-003**: The test runner configuration MUST resolve `@react-spring/*` imports to each package's source (`packages/*/src/index.ts`), preserving today's behaviour of running unit tests without a prior build step.
- **FR-004**: The animation testing helpers (`advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation`) MUST remain available with identical signatures and identical deterministic behaviour.
- **FR-005**: The global setup file currently at `packages/core/test/setup.ts` (which resets `rafz`, `frameLoop`, and `__raf` between tests) MUST be ported so that frame scheduling is reset between every test, with no cross-test leakage.
- **FR-006**: All existing test files MUST keep their test bodies (assertion logic, helper call sites, control flow) intact. The following **migration-only** edits are explicitly in scope and acceptable:

  - Runner-global renames: `jest.*` → `vi.*`, Jest globals → Vitest imports.
  - React rendering boundary swap: `@testing-library/react` → `vitest-browser-react`. The `render` return-type annotation (`RenderResult`) is dropped; `renderHook` is imported from `vitest-browser-react` (it ships one natively as of `0.1.1`).
  - `act` source change: `@testing-library/react` → `react` (React 19 native).
  - DOM-matcher migration in exactly one file (`packages/core/src/hooks/useTransition.test.tsx`): replace `@testing-library/jest-dom` matchers with `vitest-browser-react` locator-based assertions via `@vitest/browser/context`.

  Any change beyond this list constitutes a test-body rewrite and is NOT permitted under this feature.

- **FR-007**: Cypress MUST be removed from the repository: package dependency, configuration files, `cypress/` folder, related CI steps, and the `yarn test:e2e` script as it currently exists.
- **FR-008**: The parallax end-to-end scenarios currently asserted in `cypress/e2e/parallax.cy.ts` MUST be re-implemented under the new runner against the existing Vite-served parallax test app and MUST cover the same behaviours.
- **FR-009**: Code coverage MUST continue to be collected for unit tests, and the existing coverage thresholds (80% statements / 74% branches / 71% functions / 82% lines) MUST be enforced or tightened — not relaxed.
- **FR-010**: CI workflows MUST be updated to install the required browser binaries (or use a cached layer) before running tests, and the previous separate Cypress job MUST be removed.
- **FR-011**: Contributors MUST be able to run a single test file or filter by test name from the command line (equivalent to today's `yarn jest <path>` and `yarn jest -t "<pattern>"`).
- **FR-012**: Contributors MUST be able to run the suite headed (visible browser) for debugging a specific test or file.
- **FR-013**: Type checking (`yarn test:ts`) MUST continue to work unchanged; this migration MUST NOT affect the TypeScript-only verification path.
- **FR-014**: The `pre-commit` and `commit-msg` git hooks (Prettier + commitlint) MUST continue to operate unchanged.
- **FR-015**: Documentation in `CLAUDE.md` and any contributor-facing docs that reference Jest, jsdom, or Cypress MUST be updated to describe the new runner and commands.

### Key Entities _(test infrastructure)_

- **Unit Test Suite**: the set of `*.test.ts(x)` files distributed across `packages/*/src/**` and `packages/*/test/**`. Today runs under Jest with jsdom; after this work, runs under a browser-mode runner backed by Playwright.
- **Animation Test Helpers**: the global helpers attached in `packages/core/test/setup.ts` (`advance`, `advanceByTime`, etc.) and the underlying `rafz`/`frameLoop` reset hooks. These are the contract the test suite is written against.
- **Parallax E2E Suite**: the spec(s) currently under `cypress/e2e/` plus the Vite-served fixture under `packages/parallax/test`. After migration: a browser-mode spec under the new runner driving the same fixture.
- **CI Pipeline**: the GitHub Actions workflow steps that install dependencies, build, type-check, and run unit + E2E tests. Must be updated to install browsers and remove the Cypress job.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of unit tests that pass today on the `next` branch pass under the new browser-based runner with no changes to assertion logic.
- **SC-002**: 100% of the assertions made by the current `cypress/e2e/parallax.cy.ts` are re-asserted by the new browser-based E2E spec and pass.
- **SC-003**: Cypress is fully removed: zero references to `cypress`, `Cypress`, or `cy.` remain in the repository (excluding historical changelog/release notes if applicable).
- **SC-004**: Coverage thresholds remain at or above the current numbers (statements ≥ 80%, branches ≥ 74%, functions ≥ 71%, lines ≥ 82%) and are enforced by CI.
- **SC-005**: A clean install + full test run on a contributor laptop completes within a time budget no worse than 1.5× the current Jest + Cypress run on the same machine, measured wall-clock.
- **SC-006**: Watch-mode startup (first results visible) on a single package's test files completes within a time budget that keeps the dev loop usable (target: under 10 seconds on a contributor machine).
- **SC-007**: CI total test job duration (unit + E2E combined) is no worse than the sum of today's unit + E2E jobs, measured on the same runner type.
- **SC-008**: After migration, the contributor command surface for running tests (single file, name filter, watch, coverage, headed) is documented and discoverable in `CLAUDE.md`.

## Assumptions

- The project is willing to adopt Playwright-managed browser binaries as a dev dependency and accept the associated install size on contributor machines and CI runners.
- Chromium-only coverage is sufficient for unit tests; cross-browser matrix testing is out of scope for this migration (can be added later without changing the runner).
- The existing `@swc/jest` transform layer can be replaced by the new runner's native TypeScript/JSX handling without additional Babel/SWC plumbing; if a transform is still required, the new runner's built-in support is acceptable.
- The Jest `moduleNameMapper` rewriting `@react-spring/*` to `packages/*/src/index.ts` can be expressed equivalently in the new runner's resolver/alias config.
- The `mock-raf` style frame mocking will be replaced by deterministic fake-timer integration plus the existing `rafz` test hooks; no third-party mock-raf dependency is reintroduced.
- React Native–specific test paths (files matching `.native.ts(x)`) are excluded from the browser runner; if any native tests exist that are not pure logic, they are out of scope for this feature.
- Visual regression / screenshot testing is explicitly out of scope; only behavioural assertions are migrated.
- The Cypress removal is a destructive change to the workspace tooling, and the team accepts that bisecting against pre-migration commits will still require an older Cypress install.
- The `yarn test:e2e` script will be repurposed (not preserved) to invoke the new runner's E2E project; downstream automation referencing the script name will continue to work.
