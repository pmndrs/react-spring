---
'@react-spring/core': patch
---

Stop looping when a re-render flips `loop` to a falsy value. Previously a declarative update like `useSpring({ to, loop })` would keep looping even after `loop` toggled to `false`, because the in-flight loop chain captured its own `loop` value and kept scheduling iterations in parallel with the new update. The Controller now tags each loop chain with a generation token and exits when a newer external update has superseded it. Closes #1193.
