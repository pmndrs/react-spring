---
'@react-spring/types': patch
---

fix(types): infer animated values from array or ternary transition phases (#2589)

A `useTransition` or `usePresenceList` phase written as a chain (`leave: [{ opacity: 0 }, { height: 0 }]`) or as a ternary between objects with different keys typed every animated value as `SpringValue<unknown>`, so the style could not be passed to an `animated` element without a cast. Each value is now inferred from the phases as expected.
