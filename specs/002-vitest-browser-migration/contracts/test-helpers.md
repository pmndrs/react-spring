# Contract: Animation Test Helpers

**Feature**: 002-vitest-browser-migration
**Status**: Frozen — any deviation from this contract during migration is a regression.

These helpers are the public API the unit test suite is written against. The migration MUST preserve every signature and every observable behaviour on this page.

---

## Globals registered on `globalThis`

| Name                | Signature                                                                                 | Purpose                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `mockRaf`           | `MockRaf`                                                                                 | The current `@react-spring/mock-raf` instance. Recreated per test in `beforeEach`.          |
| `advance`           | `(n?: number) => Promise<void>`                                                           | Step `n` animation frames (default `1`).                                                    |
| `advanceByTime`     | `(ms: number) => Promise<void>`                                                           | Step frames until a `setTimeout(ms)` scheduled inside the helper fires.                     |
| `advanceUntil`      | `(test: () => boolean) => Promise<void>`                                                  | Step frames until `test()` returns true. Throws after 1000 steps to prevent infinite loops. |
| `advanceUntilIdle`  | `() => Promise<void>`                                                                     | Step until `frameLoop.idle && raf.count() === 0`.                                           |
| `advanceUntilValue` | `<T>(spring: FrameValue<T>, value: T) => Promise<void>`                                   | Step until `spring` reaches or passes `value`.                                              |
| `getFrames`         | `<T>(target: FrameValue<T> \| Controller<Extract<T, object>>, preserve?: boolean) => T[]` | Return recorded per-frame values. Default clears the cache; pass `true` to preserve.        |
| `countBounces`      | `(spring: SpringValue<number>) => number`                                                 | Count target-crossings in the recorded frames (without clearing them).                      |
| `setSkipAnimation`  | `(skip: boolean) => void`                                                                 | Toggle `Globals.skipAnimation`.                                                             |

---

## Per-test lifecycle invariants

`beforeEach`:

1. `isRunning = true`
2. `frameCache = new WeakMap()`
3. `frameLoop.clear()`
4. `__raf.clear()`
5. `global.mockRaf = createMockRaf()`
6. `Globals.assign({ now: mockRaf.now, requestAnimationFrame: mockRaf.raf, colors, skipAnimation: false })`

`afterEach`:

1. `isRunning = false`

These six `beforeEach` steps MUST run in this order. Cross-test leakage (a frame from test N visible in test N+1) is the most common regression vector and is the single thing this lifecycle exists to prevent.

---

## Determinism contract

- No helper depends on real wall-clock time.
- No helper depends on the browser's real `requestAnimationFrame` cadence — frames are exclusively driven by `mockRaf.step()`.
- `advanceUntil` MUST throw `Error('Infinite loop detected')` after 1000 steps; this cap is load-bearing for debugger ergonomics.
- The microtask flush between frames uses `flush-microtasks` + `act` from `@testing-library/react`; the migration MUST keep both.

---

## Acceptance checks for the ported `setup.ts`

A reviewer comparing today's `packages/core/test/setup.ts` to the migrated version should verify each line:

| Today                                                                                                                                          | Migrated                                                             | Verified? |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------- |
| `import createMockRaf, { MockRaf } from '@react-spring/mock-raf'`                                                                              | unchanged                                                            | ☐         |
| `import { flushMicroTasks } from 'flush-microtasks'`                                                                                           | unchanged                                                            | ☐         |
| `import { act } from '@testing-library/react'`                                                                                                 | `import { act } from 'react'` (React 19 native)                      | ☐         |
| `import { isEqual, is, colors, frameLoop, addFluidObserver, removeFluidObserver, getFluidObservers } from '@react-spring/shared'`              | unchanged                                                            | ☐         |
| `import { __raf as raf } from '@react-spring/rafz'`                                                                                            | unchanged                                                            | ☐         |
| `import { Globals, Controller, FrameValue, SpringValue } from '../src/index'`                                                                  | unchanged                                                            | ☐         |
| `import { computeGoal } from '../src/helpers'`                                                                                                 | unchanged                                                            | ☐         |
| `jest.setTimeout(6e8)`                                                                                                                         | `vi.setConfig({ testTimeout: 6e8 })`                                 | ☐         |
| `beforeEach(() => { … })` (Jest global)                                                                                                        | `beforeEach(() => { … })` (Vitest, via setup file as a setup script) | ☐         |
| `afterEach(() => { … })` (Jest global)                                                                                                         | `afterEach(() => { … })` (Vitest)                                    | ☐         |
| `await act(() => jest.advanceTimersByTimeAsync(1000 / 60))`                                                                                    | `await act(() => vi.advanceTimersByTimeAsync(1000 / 60))`            | ☐         |
| `global.mockRaf = createMockRaf()`                                                                                                             | unchanged (`globalThis.mockRaf`)                                     | ☐         |
| Bodies of `advance`, `advanceUntil`, `advanceByTime`, `advanceUntilIdle`, `advanceUntilValue`, `getFrames`, `countBounces`, `setSkipAnimation` | **byte-for-byte unchanged**                                          | ☐         |

If any "Verified?" column item is unchecked at PR review time, the migration is incomplete.
