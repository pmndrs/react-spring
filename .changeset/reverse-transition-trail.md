---
'@react-spring/core': minor
---

Add a `reverse` prop to `useTransition` that flips the order in which `trail` delays are assigned to transitioning items. Toggle it with caller state (e.g. `reverse: !open`) to make items animate in forward on `enter` and backward on `leave`. Render order is untouched — use `sort` for that. Closes #1794.
