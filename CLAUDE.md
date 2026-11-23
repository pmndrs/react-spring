# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Package manager**: pnpm 12 with strict isolated `node_modules` (default). Pinned via `packageManager` in root `package.json` and activated through Corepack. Scripts assume `pnpm`.
- **Node**: `.nvmrc` is `26.13.1`; `engines.node` in root `package.json` is `>=26.13.1`; CI runs the unit-test matrix on Node `22.x` and `24.x` and every other job off `.nvmrc`. Node 25+ doesn't bundle Corepack, so install it with `npm install -g corepack` before `corepack enable`.
- **Monorepo**: Turborepo + pnpm workspaces. Workspaces declared in `pnpm-workspace.yaml`: `packages/*`, `targets/*`, `demo`, `docs`.
- **Bundler**: `tsdown` per package, sharing `tsdown.config.base.mjs`. The library is **ESM-only** — each package emits a single modern ESM bundle (`dist/<name>.modern.mjs`) plus its `.d.mts` types. No CJS, no legacy/pre-compiled variants.
- **Tests**: Vitest in browser mode (Chromium via Playwright) for both unit and E2E projects, `vitest-browser-react` for rendering, `tsc --noEmit` (types). Root config: `vitest.config.ts`.
- **Lint/format**: [oxlint](https://oxc.rs/docs/guide/usage/linter) (root `.oxlintrc.json`) + [oxfmt](https://oxc.rs/docs/guide/usage/formatter) (root `.oxfmtrc.json`). Husky `pre-commit` runs `oxfmt --check`; `commit-msg` runs commitlint with `@commitlint/config-conventional`. VS Code users should install the [oxc extension](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode) — see `.vscode/extensions.json`.

## Common commands

| Task                                 | Command                                                                                       |
| ------------------------------------ | --------------------------------------------------------------------------------------------- |
| Install                              | `pnpm install --frozen-lockfile`                                                              |
| First-time browser install           | `pnpm exec playwright install chromium`                                                       |
| Build all packages                   | `pnpm build` (turbo, respects `^build` deps)                                                  |
| Build everything except docs         | `pnpm build-ci`                                                                               |
| Watch-build all packages in parallel | `pnpm dev`                                                                                    |
| Run docs / demo dev servers          | `pnpm docs:dev` / `pnpm demo:dev`                                                             |
| Full test suite                      | `pnpm test` (unit + types + e2e)                                                              |
| Unit tests                           | `pnpm test:unit`                                                                              |
| Watch unit tests                     | `pnpm vitest --project unit`                                                                  |
| Single test file                     | `pnpm vitest run packages/core/src/SpringValue.test.ts`                                       |
| Filter by test name                  | `pnpm vitest run -t "interpolation"`                                                          |
| Headed (visible browser) debugging   | `pnpm vitest --project unit --browser.headless=false <file>`                                  |
| Coverage                             | `pnpm test:cov` (thresholds: 80% statements / 74% branches / 71% functions / 82% lines)       |
| Type tests                           | `pnpm test:types` (needs a build first, see below)                                            |
| Parallax E2E                         | `pnpm test:e2e` (programmatically serves `packages/parallax/test`, runs Vitest browser specs) |
| Lint                                 | `pnpm lint` (turbo across packages)                                                           |
| Format                               | `pnpm format` / `pnpm format:check`                                                           |

Note: `vitest.config.ts` aliases `@react-spring/*` to the package source under `packages/*/src/index.ts`, so unit tests run **without** a prior build. Anything outside Vitest (docs, publishing) needs `pnpm build` first.

Type tests are the exception inside Vitest: `pnpm test:types` type-checks against each package's built `dist` types. In a fresh clone or worktree, run `pnpm build-ci` first, or it fails with `Cannot find module '@react-spring/shared'`.

Strict isolation: `node_modules` is non-hoisted, so a workspace can only `import` packages it declares in its own `package.json`. If you see a `Cannot find module 'foo'` error after adding an import, add `foo` to that workspace's `dependencies` / `peerDependencies` / `devDependencies` — do not add a hoist rule.

## Architecture

The library is a layered monorepo. Read packages bottom-up — each layer is target-agnostic until you reach `targets/*`. There is no umbrella package: consumers install a target directly (`@react-spring/web` or `@react-spring/three`).

```
          targets/web     targets/three
              │                 │
              └────────┬────────┘
                       │
              packages/core    ─── declarative API: hooks, components, SpringValue, Controller, SpringRef
                       │
              packages/animated ── Animated{Value,String,Array,Object}, createHost, withAnimated
                       │
              packages/shared  ─── FrameLoop, interpolation, colours, fluid observers, Globals, internal hooks
                       │
              packages/rafz    ─── single global rAF scheduler (queues + setTimeout)
                       │
              packages/types   ─── pure TS types, no runtime
```

### Layer responsibilities

- **`@react-spring/rafz`** — one `requestAnimationFrame` loop with five queues (`onStart`, `update`, `onFrame`, `write`, `onFinish`) plus rAF-driven `setTimeout`. `frameLoop` mode is `'always'` by default; `targets/three` flips it to `'demand'` and drives ticks via `addEffect` from `@react-three/fiber`. `__raf` is the test-only state reset (`__raf.clear()`).
- **`@react-spring/shared`** — owns `Globals` (the runtime config bag) and `FrameLoop`. Targets call `Globals.assign({ batchedUpdates, createStringInterpolator, colors, ... })` at module load to plug in platform-specific behaviour. Also exports the small internal hooks (`useConstant`, `useForceUpdate`, `useIsomorphicLayoutEffect`, etc.) that core builds on.
- **`@react-spring/animated`** — the `Animated` class hierarchy that backs every animatable prop, plus `createHost(primitives, hostConfig)`. The `hostConfig` has three seams every target implements:
  - `applyAnimatedValues(node, props)` — push the latest values to the platform's native node.
  - `createAnimatedStyle(style)` — wrap the `style` prop.
  - `getComponentProps(props)` — filter props before forwarding (e.g. web drops `scrollTop`/`scrollLeft`).
- **`@react-spring/core`** — platform-agnostic spring engine. `SpringValue` (single animated value), `Controller` (group of springs), `SpringRef` (imperative handle), `Interpolation`. Public hooks/components live under `src/hooks` and `src/components`.
- **Targets** — thin adapters. Each `targets/<name>/src/index.ts` follows the same template: `Globals.assign(...)`, define `primitives`, build a host via `createHost(primitives, { applyAnimatedValues, ... })`, then `export const animated = host.animated` and `export * from '@react-spring/core'`. To add an `animated.X` shorthand for a new element, add it to that target's `primitives.ts`.
- **`@react-spring/parallax`** — extra component layered on `@react-spring/web`. Its `test/` folder is the Vite app the E2E project serves and drives (`tests/e2e/parallax.spec.ts`).

### Where animation values flow

1. A hook (`useSpring`) creates a `Controller` of `SpringValue`s in `@react-spring/core`.
2. `SpringValue` registers as a `FluidValue` (observable from `shared/fluids`).
3. `FrameLoop` from `shared` schedules ticks on `rafz`'s `update` queue.
4. Each tick computes a new value, emits a `change` event, and the `Animated` tree subscribed via `withAnimated` reads it.
5. `withAnimated` calls the target's `applyAnimatedValues` (or React's reconciler for prop changes) to write to the host node.

### Logic that lives in two places

- `SpringValue._update` and `Controller`'s `flushUpdate` each decide whether to start another `loop` iteration and what an update resolves with. A `Controller` runs `loop` itself and passes `loop: false` to its springs, so a fix in one path never reaches the other. Check both.
- Hooks don't send the same props as a bare `Controller`. `useSpring` and `useSprings` add the declared `config` and handlers as `default` props on every render, which takes different branches in `SpringValue._merge`. Reproduce a hook bug through the hook.

## Testing model

`packages/core/test/setup.ts` is referenced from `vitest.config.ts`'s `unit` project `setupFiles` and is the single most important file for writing animation tests:

- Replaces `rafz`'s native rAF with a `mock-raf` instance every `beforeEach`, then clears `frameLoop` and `__raf`.
- Adds globals you should use **instead of** `vi.runAllTimers()` / `vi.advanceTimersByTime`:
  - `advance(n?)` — step `n` frames.
  - `advanceByTime(ms)` — step until a `setTimeout(ms)` fires.
  - `advanceUntil(predicate)` — step until `predicate()` is true (cap 1000 frames; throws on infinite loop).
  - `advanceUntilIdle()` — step until both `frameLoop` and `rafz` queues are empty.
  - `advanceUntilValue(spring, value)` — step until `spring` reaches/passes `value`.
  - `getFrames(target)` / `countBounces(spring)` — inspect recorded frame history.
  - `setSkipAnimation(bool)` — toggle `Globals.skipAnimation`.

Rendering uses `vitest-browser-react` (`import { render } from 'vitest-browser-react'`). Hook tests use the in-repo `renderHook` helper at `tests/helpers/renderHook.tsx` (imported as `@tests/helpers/renderHook`) since `vitest-browser-react` does not ship `renderHook`. `act` comes from `react` (React 19 native).

Type tests (`*.test-d.ts`) assert the resolved type with `expectTypeOf(x).toEqualTypeOf<…>()`. A call that only compiles proves little: inference can fall back to `any` or `Lookup` and still pass.

Vitest fake timers are enabled globally and fake all non-rAF time sources (`setTimeout`, `setInterval`, `Date`, `queueMicrotask`, `performance`). rAF is owned by `@react-spring/mock-raf` — never fake `requestAnimationFrame`.

Traps that make a test pass or fail for the wrong reason:

- `advanceUntilIdle()` can return between iterations of a loop that finishes without a frame (`skipAnimation`), so the loop looks settled. Count iterations with a capped `loop: () => ++n < 5` instead.
- A loop that never ends under `skipAnimation` freezes the browser, and the run fails with "Browser connection was closed".
- Don't return a `start()` promise from an `async` test helper: awaiting the helper then waits for the whole animation. Return it inside an object.
- A one-key `Controller` resolves with that spring's own result, so `value` is a number, not `{ key: number }`. `getCombinedResult` passes a single result through.

The E2E project (`pnpm test:e2e`) lives at `tests/e2e/`. `global-setup.ts` boots the parallax fixture via Vite's programmatic API on an ephemeral port and exposes the URL through Vitest's `provide`/`inject` channel (`inject('baseUrl')`).

## Releases (changesets)

All packages are version-locked. Workflow:

```sh
pnpm changeset    # add a changeset describing the change
pnpm vers         # bumps versions + internal deps
pnpm release      # clean install, build, then changeset publish
```

Release workflows (`release.yml`, `nightly.yml`, `experimental.yml`) build and publish only. They don't re-run type or unit tests: `tests.yml` already gates every merge to `next`.

For prereleases enter pre-mode first: `pnpm changeset pre enter beta|alpha|next`.

## Conventions

- Commits and PR titles follow Conventional Commits (`feat:`, `fix:`, `chore:`, …). commitlint enforces this on `commit-msg`.
- oxfmt (`.oxfmtrc.json`): no semis, single quotes, 2-space tabs, ES5 trailing commas, `arrowParens: 'avoid'`, 80-col print width.
- oxlint (`.oxlintrc.json`): `no-console` is `error` except `warn`/`error`; unused vars must be prefixed `_`. `any` is allowed intentionally (the spring engine leans on it for variance).
- A PR that widens coverage (a new TypeScript or Node version, or test runner, in the matrix) drops any slot that fails and opens a follow-up issue with the failure log, instead of fixing it in the same PR.
- The default branch is `next` (also treated as the PR base). `main` may exist but `next` is the active line.

## Fixing a bug

1. Reproduce it on `next` through the API the report uses, usually a hook, not only through `SpringValue` or `Controller`.
2. Find the line that causes it, then list every path that reaches it (see "Logic that lives in two places") and every way to trigger it. A check for one trigger in one path leaves the bug open: `loop` with `immediate`, `skipAnimation` or `duration: 0` all restart forever for the same reason.
3. Read the history before calling behaviour wrong: `git log -L` on the lines, and older issues on the same behaviour. Some of it is by design: an inline `to` array restarts on every render (#848).
4. Write the failing tests first, in the module's existing test file (`Controller.test.ts`, `useTransition.test.tsx`), never a new file named after an issue. Assert what a user can observe: what the promise resolves with, `onRest` and `onResolve` calls, whether the animation runs, `idle`. Never assert private state such as `_state` queues, and every test must be able to fail.
5. List what else reads the value you change: `onResolve`, the returned promise, `idle`, `useChain` advancing, `useTransition` expiring leaving items, `SpringRef`. Record each one's behaviour before and after the fix.
6. After the fix, remove each changed line in turn and check a test fails. A line no test needs is unguarded or unnecessary.
7. Run every CI command before opening the PR: `pnpm format:check`, `pnpm lint`, `pnpm build-ci`, `pnpm check:types`, `pnpm test:unit`, `pnpm test:types` and `pnpm test:e2e`. `check:types` catches type errors that the unit tests run straight past.
8. Fixing behaviour that never worked is a `patch`, even when someone could notice the change (#2660: handlers that never fired). Use `major` when working behaviour changes for a common pattern (#2582 changed the `config` that `ref.start(props)` uses).

## Reviewing a PR

Use the `review-pr` skill (`.claude/skills/review-pr/SKILL.md`). It reproduces the PR's claims on `next`, finds the root cause, and checks the fix sits where the cause is.

## Features, issues and the roadmap

- **Check what exists first.** Before proposing a feature, find the primitive that may already cover it: FluidValue re-targeting (a spring's `to` can be another spring), `useTrail` / `useChain`, `config.velocity` with `decay`, `useScroll`, the config presets in `packages/core/src/constants.ts`.
- **Fit the model.** Users own the springs, and `animated.*` only subscribes (`withAnimated`). Motion-style features where a component owns its animation state (`while*` props, variants, presence as props) are off-model; the react-spring form is a hook that drives the user's springs.
- **Issues state what and why.** No release, timeline or migration framing. Cite the code anchors (files, interfaces), state non-goals, and link real user issues that double as acceptance tests, so the issue is a spec an agent could implement. Use the `[feat]` / `[bug]` templates.
- **Roadmap.** The v11 roadmap is GitHub Discussion #2539. Edit it on GitHub, read its live state before each change, and keep no local copy.

<!-- SPECKIT START -->

For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
[specs/003-remix-to-react-router-7/plan.md](./specs/003-remix-to-react-router-7/plan.md)

<!-- SPECKIT END -->
