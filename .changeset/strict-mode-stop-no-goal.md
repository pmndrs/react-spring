---
'@react-spring/core': patch
---

fix(SpringValue): `stop()` no longer establishes a goal on a spring that never had one. The previous implementation always called `_focus(this.get())` to snap `animation.to` to the current value — useful for freezing a live animation, but wrong for a paused or never-started spring whose underlying value was seeded by `_prepareNode` via `from`. The bug became observable under React.StrictMode, whose simulated unmount fires `useSprings`'s cleanup (`ctrl.stop(true)`) on a freshly-mounted, paused spring, leaving `t.goal` equal to the `from` value instead of `undefined`.
