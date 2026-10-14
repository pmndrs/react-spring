---
'@react-spring/core': patch
---

fix(core): stop looping a `SpringValue` when every iteration is `immediate`, so it goes idle instead of restarting on every frame
