---
"@react-spring/core": patch
---

Propagate the `immediate` flag to every step of a `to` array chain. Previously, `immediate: true` was ignored when combined with an array `to` prop, so the animation chain would animate each step sequentially instead of jumping instantly to the final value.
