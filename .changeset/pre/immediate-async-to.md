---
'@react-spring/core': major
---

fix: `immediate` now applies to every step of an async `to` (array or script)

Previously, `immediate` on an update whose `to` was an array or async function was ignored by the steps, so the chain animated normally. Each step now inherits the update's `immediate` (boolean, predicate, or key array) unless the step sets its own. Fixes #2204.

**Breaking:** chains that relied on a bare `immediate` being ignored will now jump instead of animating. Set `immediate` on individual steps to override.
