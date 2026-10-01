---
'@react-spring/rafz': patch
---

fix(rafz): start delayed springs in an idle `frameloop="demand"` Canvas

A spring with a `delay` (including `useTrail` offsets and `useChain`) in an idle `frameloop="demand"` Canvas waited until something else rendered a frame before it started. Setting a timeout now asks the host for frames, as scheduling any other work does.
