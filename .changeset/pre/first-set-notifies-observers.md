---
'@react-spring/core': major
---

fix: `SpringValue.set` now notifies observers when it receives its first value

A `SpringValue` created without an initial value (e.g. `new SpringValue()`) used to create its `Animated` node silently on the first `set()`. Any `Interpolation`, dependent spring, or `animated` component already observing it was never told, so it stayed at `undefined`/`NaN` until the _second_ `set()`. Fixes #2374.

**Breaking:** a `SpringValue` that is already being observed will now also call `onChange` for its first value, where previously `onChange` was never called for the initial value. If your `onChange` handler assumes a previous value exists (e.g. computes a delta), guard for the first call or give the spring an initial value.
