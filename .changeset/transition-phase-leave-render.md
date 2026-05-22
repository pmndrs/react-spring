---
'@react-spring/core': patch
---

Expose `phase === 'leave'` to the `useTransition` render function during the render that runs the leave animation. Previously `t.phase` was only updated to the new phase in a layout effect after render, so the render fn always saw the previous phase (`'enter'`) while a leaving item animated out — and by the time a follow-up render could surface `'leave'`, the transition had expired and been pruned. The render fn now receives a state whose `phase` matches the upcoming animation, so consumers can reliably branch on `state.phase === 'leave'`. Closes #1654.
