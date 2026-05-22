---
'@react-spring/core': patch
---

Fire `onRest` when an animation is cancelled before its first frame. `SpringValue._stop` gated `onRest` on `anim.changed`, which only becomes `true` once a frame has rendered. When two `start()` calls happened within a single tick and the second returned the spring to its current value, the engine stopped the animation before any frame fired, so `onRest` was silently dropped. The same gap affected `set()` and `stop()` called synchronously after `start()`. Closes #1802.
