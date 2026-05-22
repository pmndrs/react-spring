---
'@react-spring/shared': patch
---

Preserve decimal precision when interpolating between stringified numbers. Previously, `useSpring({ from: '0.00', to: '1.50' })` would render `'0'` at rest and lose precision mid-tween. The string interpolator now returns each keyframe verbatim when the input lands exactly on a range value, and pads mid-animation results to the shared decimal count of the keyframes (when every keyframe has the same non-zero fractional length). Closes #1461.
