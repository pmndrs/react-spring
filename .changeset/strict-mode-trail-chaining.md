---
'@react-spring/core': patch
---

fix(useTrail): chaining no longer breaks under React.StrictMode. The `reverse` and `passedRef` accumulators inside the `useSprings` wrapper relied on the wrapper being invoked at least once per render. Under StrictMode's second render pass, `useSprings`'s internal `useMemo` caches and the wrapper is skipped, leaving the accumulators at their initial values and reversing the trail direction. For the object-form props the values are now derived directly from the shared props. Fixes #1991.
