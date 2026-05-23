---
'@react-spring/core': patch
---

Floor the spring's adaptive precision at the smallest difference doubles can represent around the values being animated. Previously, when a caller's layout math introduced tiny floating-point drift on the target (e.g. `Math.cos(Math.PI / 2)` returning `6e-17` instead of `0`, so a "logical 160" arrived as `159.99999999999997`), the adaptive precision collapsed to a value smaller than any delta the spring could express, so the animation never settled and the awaited `start()` promise never resolved. Closes #2208.
