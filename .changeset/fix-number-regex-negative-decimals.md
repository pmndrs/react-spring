---
'@react-spring/shared': patch
---

fix(shared): parse negative decimals without an integer part in numberRegex

`numberRegex` required at least one digit before the decimal point, so a value like `-.0000298023` (emitted by Chrome for some `lab()`/`oklch()` colors) was split into several tokens instead of one. That inflated a keyframe's number count and threw `The arity of each "output" value must be equal` when interpolating between color formats. The regex now matches a leading-dot fraction as a single token while keeping all previously supported number formats.
