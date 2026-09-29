---
'@react-spring/core': patch
---

fix(core): pass an AnimationResult to SpringValue `onChange`

The `SpringValue`-level `onChange` was called with the raw value instead of an `AnimationResult`, so `result.value` was `undefined` mid-animation even though the type advertises it as the value. `onChange` now receives `{ value, finished: false, cancelled: false }`, matching `onStart`/`onRest` and the `Controller`-level `onChange`. The internal `change` event the animated tree subscribes to still emits the raw value.
