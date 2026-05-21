# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Package manager**: Yarn 3.8.7 (Berry, `nodeLinker: node-modules`). All scripts assume `yarn`, not `npm`/`pnpm`. Pinned via `.yarnrc.yml`/`.yarn/releases`.
- **Node**: `.nvmrc` is `22.15.0`; CI runs Node 18/20.
- **Monorepo**: Turborepo + Yarn workspaces. Workspaces: `packages/*`, `targets/*`, `demo`, `docs`, plus `packages/parallax/@react-spring/parallax-demo`.
- **Bundler**: `tsup` per package, sharing `tsup.config.base.ts` which emits CJS (dev + prod.min) and ESM (legacy, modern, modern.dev, modern.prod.min) plus a CJS entry shim that switches on `NODE_ENV`.
- **Tests**: Jest + jsdom + `@swc/jest` (unit), `tsc --noEmit` (types), Cypress (E2E, parallax only).
- **Lint/format**: ESLint via shared `eslint-config-react-spring` package + Prettier. Husky `pre-commit` runs `prettier --check`; `commit-msg` runs commitlint with `@commitlint/config-conventional`.

## Common commands

| Task | Command |
| --- | --- |
| Install | `yarn install --immutable` |
| Build all packages | `yarn build` (turbo, respects `^build` deps) |
| Build everything except docs | `yarn build-ci` |
| Watch-build all packages in parallel | `yarn dev` |
| Run docs / demo dev servers | `yarn docs:dev` / `yarn demo:dev` |
| Full test suite | `yarn test` (ts + unit + e2e) |
| Unit tests | `yarn test:unit` |
| Single test file | `yarn jest packages/core/src/SpringValue.test.ts` |
| Filter by test name | `yarn jest -t "interpolation"` |
| Coverage | `yarn test:cov` (thresholds: 80% statements / 74% branches / 71% functions / 82% lines) |
| Type-check | `yarn test:ts` |
| Cypress E2E | `yarn test:e2e` (serves `packages/parallax/test` on :3000 via Vite, then runs Cypress) |
| Lint | `yarn lint` (turbo across packages) |
| Format | `yarn prettier:write` / `yarn prettier:check` |

Note: Jest `moduleNameMapper` rewrites `@react-spring/*` to the package source under `packages/*/src/index.ts`, so unit tests run **without** a prior build. Anything outside Jest (Cypress, docs, publish-ci) needs `yarn build` first.

## Architecture

The library is a layered monorepo. Read packages bottom-up — each layer is target-agnostic until you reach `targets/*`.

```
                react-spring (umbrella, re-exports all targets)
                       │
       ┌───────────────┼───────────────┬─────────┬─────────┐
   targets/web   targets/native   targets/three  konva   zdog
       │              │               │
       └──────────────┴───────────────┘
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
- **`@react-spring/core`** — platform-agnostic spring engine. `SpringValue` (single animated value), `Controller` (group of springs), `SpringRef` (imperative handle), `Interpolation`. Public hooks/components live under `src/hooks` and `src/components`. Hooks with native variants ship a `.native.ts` sibling (`useInView.native.ts`, `useResize.native.ts`, `useScroll.native.ts`) that React Native picks up via Metro's platform extensions.
- **Targets** — thin adapters. Each `targets/<name>/src/index.ts` follows the same template: `Globals.assign(...)`, define `primitives`, build a host via `createHost(primitives, { applyAnimatedValues, ... })`, then `export const animated = host.animated` and `export * from '@react-spring/core'`. To add an `animated.X` shorthand for a new element, add it to that target's `primitives.ts`.
- **`react-spring`** (umbrella) — depends on every target and only re-exports. Don't add logic here.
- **`@react-spring/parallax`** — extra component layered on `@react-spring/web`. Its `test/` folder is the Vite app Cypress points at.

### Where animation values flow

1. A hook (`useSpring`) creates a `Controller` of `SpringValue`s in `@react-spring/core`.
2. `SpringValue` registers as a `FluidValue` (observable from `shared/fluids`).
3. `FrameLoop` from `shared` schedules ticks on `rafz`'s `update` queue.
4. Each tick computes a new value, emits a `change` event, and the `Animated` tree subscribed via `withAnimated` reads it.
5. `withAnimated` calls the target's `applyAnimatedValues` (or React's reconciler for prop changes) to write to the host node.

## Testing model

`packages/core/test/setup.ts` is loaded into every Jest run and is the single most important file for writing animation tests:

- Replaces `rafz`'s native rAF with a `mock-raf` instance every `beforeEach`, then clears `frameLoop` and `__raf`.
- Adds globals you should use **instead of** `jest.runAllTimers()` / `jest.advanceTimersByTime`:
  - `advance(n?)` — step `n` frames.
  - `advanceByTime(ms)` — step until a `setTimeout(ms)` fires.
  - `advanceUntil(predicate)` — step until `predicate()` is true (cap 1000 frames; throws on infinite loop).
  - `advanceUntilIdle()` — step until both `frameLoop` and `rafz` queues are empty.
  - `advanceUntilValue(spring, value)` — step until `spring` reaches/passes `value`.
  - `getFrames(target)` / `countBounces(spring)` — inspect recorded frame history.
  - `setSkipAnimation(bool)` — toggle `Globals.skipAnimation`.

Cypress only covers `@react-spring/parallax` (`cypress/e2e/parallax.cy.ts`); the workflow's `test-e2e` job is currently commented out, so E2E only runs locally.

## Releases (changesets)

All packages are version-locked. Workflow:

```sh
yarn changeset    # add a changeset describing the change
yarn vers         # bumps versions + internal deps
yarn release      # clean install, build, type-check, unit test, then changeset publish
```

For prereleases enter pre-mode first: `yarn changeset pre enter beta|alpha|next`.

## Conventions

- Commits and PR titles follow Conventional Commits (`feat:`, `fix:`, `chore:`, …). commitlint enforces this on `commit-msg`.
- Prettier config: no semis, single quotes, 2-space tabs, ES5 trailing commas, `arrowParens: 'avoid'`, 80-col print width.
- ESLint: `no-console` is `error` except `warn`/`error`; unused vars must be prefixed `_`; `@typescript-eslint/no-explicit-any` is **off** intentionally (the spring engine leans on `any` for variance).
- The default branch is `next` (also treated as the PR base). `main` may exist but `next` is the active line.
