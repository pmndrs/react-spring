# Phase 0 Research: Vitest Browser Migration

**Feature**: 002-vitest-browser-migration
**Date**: 2026-05-21

Each subsection resolves a NEEDS-CLARIFICATION-equivalent item from the plan's Technical Context.

---

## R1. Runner choice — Vitest

**Decision**: Adopt **Vitest** (latest stable on the 2.x or 3.x line at implementation time) as both the unit and E2E runner.

**Rationale**:

- It is the only modern runner that natively supports both a fast Node/jsdom-style unit mode _and_ a real-browser mode under a single config and a single global API.
- The user's premise (real browser via Playwright under the hood) is satisfied by `@vitest/browser` with the `playwright` provider.
- Project already uses Vite (`packages/parallax/test/vite.config.ts`, docs/demo dev servers); Vitest's reuse of Vite's resolver and transform pipeline removes the need for `@swc/jest`'s custom transform.
- Jest globals (`describe`, `it`, `expect`, `beforeEach`, `afterEach`) translate one-to-one; the migration of test bodies is mostly mechanical.

**Alternatives considered**:

- **Web Test Runner (`@web/test-runner`)** — viable real-browser runner; rejected because its assertion ergonomics and watch-mode UX trail Vitest's, and migrating Jest-style tests requires more rewriting (Mocha-style globals, different mock APIs).
- **Playwright Test (`@playwright/test`)** — excellent for E2E but a poor unit-test ergonomic match (every test runs in a browser context with one-test-per-file conventions). Would force a two-runner outcome — the opposite of the user's goal.
- **Jest with `jest-playwright-preset` or `jest-environment-puppeteer`** — keeps Jest but layers a browser on top. Rejected because the real-browser shim is still leakier than Vitest's native browser mode, and we keep the jsdom problem for any test that does not explicitly opt in.

---

## R2. Provider choice — Playwright/Chromium

**Decision**: `@vitest/browser` with `provider: 'playwright'` and `browser: 'chromium'`. No headless/headed lock-in in config — controlled by CLI flag.

**Rationale**:

- Playwright provider is the most mature, has first-class Vitest support, and matches Cypress's current single-browser (Chromium-only) coverage — so no functional regression in browser matrix.
- Chromium is also the runtime targeted by `cypress.config.ts` today, so behavioural parity is direct.
- Playwright's Chromium binary is already cached on GitHub Actions runners (~135 MB compressed), with a well-known `~/.cache/ms-playwright` cache key.

**Alternatives considered**:

- **`webdriverio` provider** — slower handshake, less reliable on Actions; no reason to pick it given Playwright is already the user's framing.
- **`preview` provider (no automation)** — only suitable for headed dev; can't drive CI.

---

## R3. Timer & frame strategy — keep `mock-raf`, fake non-rAF timers

**Decision**: In `vitest.config.ts` enable `fakeTimers` with `toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'queueMicrotask', 'performance']` — explicitly **omitting** `requestAnimationFrame` and `cancelAnimationFrame`. `@react-spring/mock-raf` (in-tree) continues to own rAF.

**Rationale**:

- Today's `setup.ts` does exactly this: it leaves rAF to `mock-raf` and uses `jest.advanceTimersByTimeAsync(1000/60)` to flush the microtask queue between frames. Vitest's `vi.advanceTimersByTimeAsync` is a drop-in replacement.
- The browser's real rAF would tick at display refresh and break determinism — the entire animation suite depends on `mockRaf.step()` being the only frame source.
- Keeping `mock-raf` means the helpers' implementation is byte-for-byte the same; only the Jest namespace is renamed.

**Alternatives considered**:

- **Use Vitest's `vi.useFakeTimers({ toFake: ['requestAnimationFrame'] })`** — Vitest's fake rAF doesn't expose the per-step API `mock-raf` provides (`now`, `step`, custom now-fn injection via `Globals.assign`). Would require rewriting the helpers. Rejected.
- **Drop `mock-raf`, drive real rAF** — non-starter: tests would become wall-clock dependent and flaky.

---

## R4. Module resolution — Vite `resolve.alias`

**Decision**: In the root `vitest.config.ts`, set:

```ts
resolve: {
  alias: [
    { find: /^@react-spring\/mock-raf$/, replacement: '<repo>/packages/mock-raf/index.js' },
    { find: /^@react-spring\/(.*)$/, replacement: '<repo>/packages/$1/src/index.ts' },
    { find: /^react$/, replacement: '<repo>/node_modules/react' },
  ],
},
```

**Rationale**:

- Direct one-to-one port of today's Jest `moduleNameMapper`. Vite alias semantics (regex with capture group → `$1`) work identically.
- Keeps the "tests run without a prior `pnpm build`" property (Constitution alignment).
- The explicit `react` alias guards against pnpm's strict isolation surfacing multiple React copies through transitive deps.

**Alternatives considered**:

- **Per-package configs with workspace-relative paths** — duplicates the alias map N times and complicates IDE integration. Rejected.
- **Rely on pnpm workspace resolution alone** — would resolve to each package's built `dist/` (because `package.json` `main`/`exports` point there), not `src/`. Defeats the purpose.

---

## R5. Coverage — `@vitest/coverage-v8`

**Decision**: Use `@vitest/coverage-v8` (V8 native, no Babel/SWC re-instrumentation). Configure:

```ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'json'],
  include: [
    'packages/{animated,core,rafz,shared}/src/*.{ts,tsx}',
    'targets/web/src/*.{ts,tsx}',
  ],
  thresholds: { statements: 80, branches: 74, functions: 71, lines: 82 },
},
```

**Rationale**:

- V8 coverage is faster and more accurate than istanbul for TS code transpiled by Vite. No SWC plugin needed.
- `include` mirrors today's `collectCoverageFrom`.
- Thresholds are the existing floor (Constitution Quality Gates §1).

**Alternatives considered**:

- **`@vitest/coverage-istanbul`** — better per-branch granularity historically; ~2× slower in our case and not needed since current thresholds were calibrated against `@swc/jest`'s built-in instrumentation, which is closer to V8's behaviour than Istanbul's.

---

## R6. React Native exclusion

**Decision**: In the `unit` project, set `test.include` to `['packages/**/src/**/*.test.{ts,tsx}', 'targets/web/src/**/*.test.{ts,tsx}']` and `test.exclude` to `['**/*.native.{ts,tsx}', '**/node_modules/**', '**/dist/**', '**/__snapshots__/**']`.

**Rationale**:

- Today's Jest config relies on the fact that no `.native.ts(x)` test files exist; Metro's platform extension would pick `.native.ts` only on React Native. Belt-and-braces by adding the explicit exclude pattern guards against future contributors adding browser-incompatible native tests.

**Alternatives considered**:

- **Run native tests in Node** — they don't exist today; pure speculation. Out of scope.

---

## R7. E2E orchestration — Vitest project + Vite fixture

**Decision**: Define a second project in `vitest.config.ts` named `e2e` that points `test.include` at `tests/e2e/**/*.spec.ts`, uses the same Playwright/Chromium provider, and orchestrates the Vite fixture via a `globalSetup` hook:

```ts
// tests/e2e/global-setup.ts
import { createServer, type ViteDevServer } from 'vite'
import type { TestProject } from 'vitest/node'

let server: ViteDevServer

export default async function ({ provide }: TestProject) {
  server = await createServer({
    root: 'packages/parallax/test',
    server: { port: 0 }, // ephemeral
  })
  await server.listen()
  const address = server.httpServer!.address()
  const port = typeof address === 'object' && address ? address.port : 3000
  provide('baseUrl', `http://localhost:${port}`)
}

export async function teardown() {
  await server?.close()
}
```

The typed channel is declared once in `vitest.config.ts`:

```ts
declare module 'vitest' {
  export interface ProvidedContext {
    baseUrl: string
  }
}
```

Specs then read it with:

```ts
import { inject } from 'vitest'
const baseUrl = inject('baseUrl')
```

**Rationale**:

- Replaces today's `start-server-and-test 'pnpm vite serve ...' http-get://localhost:3000 'pnpm cypress run'` with a single Node process — Vite is invoked programmatically; no port races.
- Project-scoped globalSetup runs once per `pnpm test:e2e`, mirroring Cypress's single-server-for-the-run model.
- **`provide`/`inject` instead of `process.env`** — the spec runs in Chromium, not Node, so `process.env` set in `globalSetup` is invisible to the test. Vitest's `provide`/`inject` is the first-class cross-context channel.
- **Ephemeral port (`port: 0`)** — eliminates "port 3000 in use" failures when a contributor is also running `pnpm demo:dev` locally.

**Alternatives considered**:

- **Keep `start-server-and-test`** — still works; adds a top-level dependency for no reason now that Vite has a programmatic API.
- **Vitest `serve` config** — Vitest can serve files, but the parallax fixture needs its own Vite config (it has plugins, aliases); easier to drive the existing config programmatically.

---

## R8. React rendering — `vitest-browser-react` (no Testing Library)

**Decision**: Adopt `vitest-browser-react`'s `render` as the single React-rendering primitive. Remove `@testing-library/react`, `@testing-library/dom`, and `@testing-library/jest-dom` entirely. Take `act` from `react` (React 19's native export). Provide a small in-repo `renderHook` helper (~15 lines) since `vitest-browser-react` deliberately does not ship one.

**Rationale**:

- `vitest-browser-react` is the official pairing for `@vitest/browser` (per the user's reference: https://vitest.dev/api/browser/react). It returns Playwright locators directly via `@vitest/browser/context`, so element queries and assertions reuse the same machinery as the rest of the browser-mode runner — no parallel jsdom-style query layer.
- Testing Library's `render` returns synchronous DOM nodes and a separate `screen` global; `vitest-browser-react` returns locators that auto-retry, matching the asynchronous reality of a real browser tab.
- Removing `@testing-library/jest-dom` is acceptable because its matchers are used in exactly one file (`useTransition.test.tsx`). The locator API exposes `toBeInTheDocument`, `toHaveStyle`, etc. via `expect.element(locator).toBeInTheDocument()` natively — no shim required.
- `act` lives on `react` itself since React 18.3; pulling it from there removes the only remaining reason to keep `@testing-library/react` installed.

**Call-site impact (sized — small)**:

| File                                                 | Today                                                                                                  | After                                                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `packages/core/test/setup.ts`                        | `import { act } from '@testing-library/react'`                                                         | `import { act } from 'react'`                                                                                           |
| `packages/core/src/SpringContext.test.tsx`           | `import { render, RenderResult } from '@testing-library/react'`                                        | `import { render } from 'vitest-browser-react'`; drop `RenderResult` type (use inferred return)                         |
| `packages/core/src/hooks/useSpring.test.tsx`         | same as above                                                                                          | same as above                                                                                                           |
| `packages/core/src/hooks/useSprings.test.tsx`        | same as above                                                                                          | same as above                                                                                                           |
| `packages/core/src/hooks/useTrail.test.tsx`          | same as above                                                                                          | same as above                                                                                                           |
| `packages/core/src/hooks/useTransition.test.tsx`     | `import '@testing-library/jest-dom'` + `import { RenderResult, render } from '@testing-library/react'` | drop jest-dom import; use locator-based `expect.element(...)` matchers; `import { render } from 'vitest-browser-react'` |
| `packages/core/src/hooks/useSpringValue.test.ts`     | `import { renderHook } from '@testing-library/react'`                                                  | `import { renderHook } from 'tests/helpers/renderHook'` (in-repo)                                                       |
| `packages/shared/src/hooks/useReducedMotion.test.ts` | `import { act, renderHook } from '@testing-library/react'`                                             | `import { act } from 'react'`; `import { renderHook } from 'tests/helpers/renderHook'`                                  |
| `targets/web/src/animated.test.tsx`                  | `import { render } from '@testing-library/react'`                                                      | `import { render } from 'vitest-browser-react'`                                                                         |

**In-repo `renderHook` helper sketch** (`tests/helpers/renderHook.tsx`):

```tsx
import { render } from 'vitest-browser-react'

export function renderHook<R>(hook: () => R) {
  const ref: { current: R } = { current: undefined as unknown as R }
  function Probe() {
    ref.current = hook()
    return null
  }
  const utils = render(<Probe />)
  return {
    get result() {
      return ref
    },
    rerender: () => utils.rerender(<Probe />),
    unmount: utils.unmount,
  }
}
```

This matches the subset of Testing Library's `renderHook` API actually used by `useSpringValue.test.ts` and `useReducedMotion.test.ts` (both consume `result.current` and `unmount`; neither uses `rerender` with new args — verify during W3 and extend the helper if needed).

**Alternatives considered**:

- **Keep `@testing-library/react` alongside `vitest-browser-react`** — pragmatic short-term but defeats the user's explicit ask and leaves two query APIs in the suite. Rejected.
- **Use `@testing-library/react` only for `renderHook`** — same objection; also leaves a dependency for one helper.
- **Write hook tests as full component tests instead of using `renderHook`** — bigger rewrite than the helper.

---

## R9. CI install footprint — cache Playwright Chromium

**Decision**: In `.github/workflows/tests.yml`, the `test-unit` and `test-e2e` jobs each add:

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-chromium-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

- name: Install Playwright Chromium
  run: pnpm exec playwright install --with-deps chromium
```

**Rationale**:

- ~135 MB compressed; cached on cache hit, only installed on lockfile change.
- `--with-deps` installs the Ubuntu system libs Chromium needs (libnss, libatk, etc.); GitHub-hosted runners already have most, but the flag is idempotent and protects against runner image drift.

**Alternatives considered**:

- **Use `mcr.microsoft.com/playwright` container** — heavier and locks the Node version; rejected.
- **Skip the cache** — first-run impact ~30 s; cache hit drops it to ~2 s. Worth the trivial YAML.

---

## R10. Node version compatibility

**Decision**: Vitest 2.x supports Node 18.20+. The current `tests.yml` matrix is Node 20.x; `publish-ci` matrix is Node 18.x and runs `npm test` inside example projects (does **not** invoke Vitest). No matrix change needed.

**Rationale**:

- The browser test job is Node 20.x.
- Publish-CI runs CRA5/Next/Vite consumer-side smoke tests with their own `npm test`; this migration does not touch those.

**Alternatives considered**:

- **Drop Node 18 from publish-CI** — out of scope; addressed separately if needed.

---

## Open follow-ups (not blocking)

1. After landing, measure the SC-005 / SC-006 / SC-007 numbers on a contributor machine and the Actions runner; attach to the PR description.
2. Consider a future cross-browser matrix (Firefox + WebKit) once the migration is stable.
3. Consider replacing `start-server-and-test` in any remaining demo/docs flows.
