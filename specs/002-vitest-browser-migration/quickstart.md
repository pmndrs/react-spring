# Quickstart: Running Tests After the Vitest Migration

**Feature**: 002-vitest-browser-migration

After this feature lands, contributors use these commands.

---

## First-time setup

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

The Playwright Chromium download is ~135 MB and is cached at `~/.cache/ms-playwright`. Run the install command once; subsequent contributors won't need to repeat unless the lockfile changes.

---

## Day-to-day commands

| Task                             | Command                                                    |
| -------------------------------- | ---------------------------------------------------------- |
| Run all unit tests               | `pnpm test:unit`                                           |
| Run all unit tests in watch mode | `pnpm vitest --project unit`                               |
| Run a single unit test file      | `pnpm vitest run packages/core/src/SpringValue.test.ts`    |
| Filter by test name              | `pnpm vitest run -t "interpolation"`                       |
| Run with coverage                | `pnpm test:cov`                                            |
| Type-check (unchanged)           | `pnpm test:ts`                                             |
| Run parallax E2E                 | `pnpm test:e2e`                                            |
| Run a single E2E spec            | `pnpm vitest run --project e2e tests/e2e/parallax.spec.ts` |
| Run unit + types + E2E           | `pnpm test`                                                |

---

## Debugging

### Headed (visible browser) debugging

```sh
pnpm vitest --project unit --browser.headless=false packages/core/src/SpringValue.test.ts
```

The Chromium window stays open; use the DevTools console and the Vitest UI overlay to inspect failures.

### Vitest UI

```sh
pnpm vitest --project unit --ui
```

Opens the Vitest dashboard at `http://localhost:51204/__vitest__/` with test tree, output, and timing.

### Single-file watch

```sh
pnpm vitest --project unit packages/core/src/SpringValue.test.ts
```

Watch mode is on by default when not using `run`.

---

## What changed from before

| Old (Jest + Cypress)                                  | New (Vitest browser)                                                |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| `pnpm jest packages/core/src/SpringValue.test.ts`     | `pnpm vitest run packages/core/src/SpringValue.test.ts`             |
| `pnpm jest -t "interpolation"`                        | `pnpm vitest run -t "interpolation"`                                |
| `pnpm test:e2e` (start-server-and-test + cypress run) | `pnpm test:e2e` (Vite served programmatically + Vitest E2E project) |
| `jest.config.js`                                      | `vitest.config.ts`                                                  |
| `packages/core/test/setup.ts` (Jest globals)          | `packages/core/test/setup.ts` (Vitest globals — same helpers)       |
| jsdom environment                                     | Chromium via Playwright                                             |

The animation testing helpers (`advance`, `advanceByTime`, `advanceUntil`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation`) are **unchanged** — your existing tests do not need rewriting.

---

## Coverage thresholds

Floor unchanged from the Jest config — enforced by CI:

| Metric     | Threshold |
| ---------- | --------- |
| Statements | 80%       |
| Branches   | 74%       |
| Functions  | 71%       |
| Lines      | 82%       |

Coverage is collected via `@vitest/coverage-v8` (no extra instrumentation flag needed).

---

## Troubleshooting

- **"Cannot find browser 'chromium'"** — run `pnpm exec playwright install chromium`.
- **Hangs with no output on CI** — the Playwright cache step likely missed; re-run with `--with-deps` and confirm `~/.cache/ms-playwright` exists.
- **Test fails with "Infinite loop detected"** — your test is using `advanceUntil` with a predicate that never returns true. Same semantics as before; nothing migration-specific.
- **Snapshot mismatch on first run** — Vitest's default inline snapshot serialiser differs slightly from Jest's. If you see this for a test that did not change, regenerate with `pnpm vitest run -u <file>`.
