---
'@react-spring/core': major
---

fix(core)!: type per-key event-handler arguments for `useSpring`/`useTransition` (#2541)

Per-key handlers like `onChange: { x: result => result.value }` now infer `result.value` from the animated value instead of `any`. Props are stricter as a result, so loosely-typed props may need annotating.
