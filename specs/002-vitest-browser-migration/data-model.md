# Phase 1 Data Model: Test Infrastructure Entities

**Feature**: 002-vitest-browser-migration

This feature has no runtime data model — the "entities" here are the test-infrastructure objects the migration touches. Capturing them explicitly makes review and `/speckit-tasks` decomposition straightforward.

---

## Entity: RunnerConfig

**Location**: `vitest.config.ts` (root, NEW).

**Shape**:

```ts
defineConfig({
  resolve: { alias: Alias[] },
  test: {
    globals: true,
    projects: [UnitProject, E2EProject],
  },
})
```

### Sub-entity: Alias

| Field         | Type                | Notes                                            |
| ------------- | ------------------- | ------------------------------------------------ |
| `find`        | `string \| RegExp`  | One per entry in the current `moduleNameMapper`. |
| `replacement` | `string` (abs path) | Source path.                                     |

Concrete entries:

| `find`                        | `replacement`                       |
| ----------------------------- | ----------------------------------- |
| `/^react$/`                   | `<repo>/node_modules/react`         |
| `/^@react-spring\/mock-raf$/` | `<repo>/packages/mock-raf/index.js` |
| `/^@react-spring\/(.*)$/`     | `<repo>/packages/$1/src/index.ts`   |

### Sub-entity: UnitProject

| Field                 | Value                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `name`                | `"unit"`                                                                                                  |
| `browser.enabled`     | `true`                                                                                                    |
| `browser.provider`    | `"playwright"`                                                                                            |
| `browser.instances`   | `[{ browser: 'chromium' }]`                                                                               |
| `browser.headless`    | `true` (CI) / configurable (local)                                                                        |
| `setupFiles`          | `["./packages/core/test/setup.ts"]`                                                                       |
| `include`             | `["packages/**/src/**/*.test.{ts,tsx}", "targets/**/src/**/*.test.{ts,tsx}"]`                             |
| `exclude`             | `["**/*.native.{ts,tsx}", "**/node_modules/**", "**/dist/**", "**/__snapshots__/**"]`                     |
| `fakeTimers.toFake`   | `['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'queueMicrotask', 'performance']` |
| `coverage.provider`   | `"v8"`                                                                                                    |
| `coverage.include`    | `["packages/{animated,core,rafz,shared}/src/*.{ts,tsx}", "targets/web/src/*.{ts,tsx}"]`                   |
| `coverage.thresholds` | `{ statements: 80, branches: 74, functions: 71, lines: 82 }`                                              |

### Sub-entity: E2EProject

| Field               | Value                                          |
| ------------------- | ---------------------------------------------- |
| `name`              | `"e2e"`                                        |
| `browser.enabled`   | `true`                                         |
| `browser.provider`  | `"playwright"`                                 |
| `browser.instances` | `[{ browser: 'chromium' }]`                    |
| `globalSetup`       | `["tests/e2e/global-setup.ts"]`                |
| `include`           | `["tests/e2e/**/*.spec.ts"]`                   |
| `fakeTimers`        | **NOT enabled** — real timing, this is an E2E. |

---

## Entity: SetupModule

**Location**: `packages/core/test/setup.ts` (EDITED). Referenced directly from `setupFiles: ['./packages/core/test/setup.ts']` in `vitest.config.ts`'s `unit` project — no separate root shim.

**Responsibilities** (unchanged from today, only renamed APIs):

1. `beforeEach`: reset `isRunning`, `frameCache`, `frameLoop`, `__raf`; create fresh `mockRaf`; `Globals.assign({ now, requestAnimationFrame, colors, skipAnimation: false })`.
2. `afterEach`: set `isRunning = false`.
3. Attach helpers to `globalThis`: `advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation`.
4. Configure long test timeout (`vi.setConfig({ testTimeout: 6e8 })`) — replaces `jest.setTimeout(6e8)`.
5. **No** matcher-extension imports — `@testing-library/jest-dom` is removed; `vitest-browser-react`'s locator assertions (via `@vitest/browser/context`) cover the matchers we use.

**Diff summary** (mechanical):

| Today (Jest)                                   | After (Vitest)                                   |
| ---------------------------------------------- | ------------------------------------------------ |
| `jest.setTimeout(6e8)`                         | `vi.setConfig({ testTimeout: 6e8 })`             |
| `jest.advanceTimersByTimeAsync(1000/60)`       | `vi.advanceTimersByTimeAsync(1000/60)`           |
| `beforeEach`, `afterEach` (Jest globals)       | `import { beforeEach, afterEach } from 'vitest'` |
| Implicit Jest globals                          | `import { vi } from 'vitest'`                    |
| `import { act } from '@testing-library/react'` | `import { act } from 'react'`                    |

Helper bodies (`advance`, `advanceUntil`, …) are **not modified**.

---

## Entity: TestHelpers

See `contracts/test-helpers.md`. Frozen contract — any breaking change requires a major review.

---

## Entity: E2EFixture

**Location**: `packages/parallax/test/` (UNCHANGED).

**Driven by**: `tests/e2e/global-setup.ts` programmatically (Vite `createServer({ root: 'packages/parallax/test' })`).

**Exposes**: `process.env.BASE_URL = http://localhost:<port>` to E2E specs.

**Tear-down**: Returned `teardown` async function in `globalSetup` calls `server.close()`.

---

## Entity: CIPipeline

**Location**: `.github/workflows/tests.yml` (EDITED).

**Changes**:

| Job              | Today                   | After                                                                           |
| ---------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `changes` filter | includes `cypress/**`   | remove `cypress/**`                                                             |
| `test-unit`      | `pnpm test:unit` (Jest) | add Playwright cache + install steps; same script (`vitest run --project unit`) |
| `test-e2e`       | commented out           | uncommented; uses Playwright cache + `vitest run --project e2e`                 |

---

## Removed entities

- `jest.config.js` — deleted.
- `cypress.config.ts` — deleted.
- `cypress/` (folder, all specs, support, screenshots, snapshots) — deleted.
