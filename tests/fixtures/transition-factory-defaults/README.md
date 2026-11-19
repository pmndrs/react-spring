# useTransition props-function defaults reproduction

This source-only regression fixture compares object props, props returned by a function, and a props function with an injected `SpringRef`. It uses the actual repository source, the normal animation clock, and no scheduler or controller mocks. It is not a new demo-hub entry.

From a full checkout with the repository-pinned dependencies installed, run at the repository root:

```sh
pnpm exec vite --config vitest.config.ts --host 127.0.0.1 --port 4179
```

Open the address printed by Vite and append `/tests/fixtures/transition-factory-defaults/`. The existing Vitest config supplies source aliases; it does not run the test setup in this page. No package build is needed.

With the repair, the object and function boxes move to `x: 240`, `opacity: 1` and show one start and one rest. The injected-ref case stays idle until **Start injected transition** is clicked, then reaches the same result. Change/frame counts depend on browser timing and are not a performance benchmark.

On the unpatched source, function-form handlers are not inherited as defaults, so the animation can finish without updating its counters. For a comparison, use a separate temporary baseline checkout rather than discarding existing work. The fixture is diagnostic only; it does not make release, cancellation, or performance guarantees.
