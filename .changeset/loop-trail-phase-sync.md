---
'@react-spring/core': patch
---

fix(useTrail): with `loop: true`, deeper springs trap in a mid-range oscillation instead of sweeping the full from→to distance each cycle. The trail chains children via `to: parent.springs`, so every parent change resets the child's animation progress; under looping, the head snap-resets each cycle but children only chase fluidly. An internal `Controller.onLoopReset` subscription now fires synchronously when the head recurses into the next loop iteration, and every non-head child snaps back to `from` in phase. The fluid-chain contract is preserved. Fixes #1063.
