---
'@react-spring/rafz': patch
'@react-spring/shared': patch
'@react-spring/three': patch
---

Fix looping/sequenced animations freezing under `@react-three/fiber`'s `frameloop="demand"`. The three target drives `rafz` from r3f's render loop, which only runs while frames are requested via `invalidate()`. When a `loop`/`to`-array/`delay` animation reached a segment boundary, the spring went idle for the microtask gap while the next segment was scheduled — r3f's loop stopped and nothing restarted it, so the animation froze (and event-driven `invalidate()` calls couldn't help, since they're cancelled by r3f's same-frame decrement). `rafz` now exposes an `onDemand` signal that fires while it has pending frame work; the three target turns it into an `invalidate()` deferred to after the current frame, cleanly restarting r3f's loop. Demand mode is preserved — once the animation settles, the canvas sleeps again. No more `invalidate()`-in-events or `useFrame` workarounds needed. Closes #2402.
