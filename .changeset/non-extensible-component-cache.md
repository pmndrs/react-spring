---
'@react-spring/animated': patch
---

Fix `cannot add a new property` crash when wrapping non-extensible React Native host components.

`createHost` cached animated wrappers by writing directly to the component object via `Component[Symbol.for('AnimatedComponent')] = ...`. On Hermes (React Native), host components like `View`, `Text`, and `Image` become non-extensible after their first JSX render, causing a `TypeError` in strict mode.

The fix attempts the direct write first (fast path, no change for extensible components) and falls back to a module-level `WeakMap` when the write is rejected.
