---
'@react-spring/shared': patch
---

Stop the string interpolator throwing `Cannot read properties of null (reading 'map')` when an output value contains no numbers. Strings like `boxShadow: 'none'` or an unresolved CSS variable that falls through as its literal `var(--x)` text now extract to no numeric tokens and interpolate gracefully instead of hitting a null `String.match`. Closes #2327.
