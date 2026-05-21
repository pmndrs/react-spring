---
'@react-spring/web': patch
---

fix(web): remove DOM attributes when their animated value becomes `undefined`

Previously, attributes such as `inert`, `disabled`, `viewBox`, `className`, and `children` were coerced to the string `"undefined"` or left stale when their animated value resolved to `undefined`. Boolean-style attributes like `inert` must be entirely removed to be disabled — setting them to any value (including `"undefined"`) keeps them active. `applyAnimatedValues` now calls `removeAttribute` (or clears the class/textContent) in this case.
