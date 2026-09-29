---
'@react-spring/core': major
---

**Breaking:** `onRest` no longer fires when an active animation is retargeted

Calling `spring.start()` with a new `to` value mid-flight no longer
invokes the previous animation's `onRest` handler. `onRest` is
documented as called when the animation comes to a stand-still, and a
retarget is not a stand-still — the spring keeps moving toward the new
goal. The `start()` promise still resolves with `finished: false` on
retarget, so callers that need the old goal-abandoned signal can read
it there. `onRest` continues to fire as before on `reset`, on `cancel`,
and on normal settle.

**Migration:** If you relied on `onRest` running on every retarget
(e.g. for cleanup or analytics), inspect the `start()` promise's
`finished: false` resolution instead, or move the side effect into
`onChange`.
