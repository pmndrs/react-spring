---
'@react-spring/core': patch
---

Auto-start `useTransition` when `props` is a function. The function/`deps` form creates an internal `SpringRef`, which was assigned to every controller and treated like an injected ref, so the documented `useTransition(data, () => ({ ... }))` form never started its enter animation. `useTransition` now matches `useSpring`/`useSprings`: only an _injected_ ref (via `config.ref`) defers auto-start, so `useChain` and StrictMode remounts keep working. Note: if you previously worked around this by calling `api.start()` manually on the function form, the transition now also auto-starts. Closes #2287.
