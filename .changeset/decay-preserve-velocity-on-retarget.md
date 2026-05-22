---
'@react-spring/core': patch
---

Preserve `config.velocity` across `to`/`from` retargets when `config.decay` is set. Previously, `SpringValue._update` unconditionally reset `config.velocity` to `0` whenever a new goal was provided, which silently broke gesture-driven decay flows that retarget mid-throw (e.g. mouse-flick decay). Also clarifies the `decay` JSDoc and docs-site reference to explain that decay decelerates from an initial velocity and does not ease toward `to`. Closes #1843.
