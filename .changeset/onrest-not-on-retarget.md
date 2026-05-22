---
'@react-spring/core': patch
---

fix(core): stop firing `onRest` when an active animation is retargeted

Calling `spring.start()` with a new `to` value mid-flight no longer
invokes the previous animation's `onRest` handler. `onRest` is
documented as "called when the animation comes to a stand-still", and a
retarget is not a stand-still — the spring keeps moving toward the new
goal. The `start()` promise still resolves with `finished: false` on
retarget, so callers that need the old goal-abandoned signal can read it
there. `onRest` continues to fire as before on `reset`, on `cancel`, and
on normal settle.
