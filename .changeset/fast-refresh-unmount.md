---
'@react-spring/core': patch
'@react-spring/shared': patch
---

Keep animations running after a Fast Refresh edit. `useSpring`, `useSprings`, `useTrail`, `useTransition` and `usePresence` no longer stop their springs mid-animation when the component is edited and saved.
