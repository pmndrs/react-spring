---
'@react-spring/core': patch
---

fix(core): infer all animated keys when a partial `from` is provided

`PickAnimated` returned only the `from` shape whenever a `from` prop was present, dropping forward props, `to` keys, and the other transition phases. `useSpring({ width: 100, height: 100, from: { width: 0 } })` typed its result as `{ width }`, so `styles.height` was a compile error even though `height` animates at runtime. It now merges `from` with the `to`, forward, and transition-phase values.
