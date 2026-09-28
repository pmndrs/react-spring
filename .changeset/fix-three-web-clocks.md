---
'@react-spring/three': patch
'@react-spring/web': patch
---

fix(three): run three springs on React Three Fiber's frames and web springs on the browser's

Importing `@react-spring/three` no longer freezes springs from `@react-spring/web` while no `Canvas` is rendering. Each spring now runs on the clock of the package it comes from: springs from `@react-spring/three` follow React Three Fiber's frames (including XR, and `advance()` with `frameloop="never"`), and springs from `@react-spring/web` follow the browser. `Globals.assign` clock options (`requestAnimationFrame`, `now`, `batchedUpdates`, `frameLoop`, `onDemand`), `raf.advance()` and `update()` now only affect web springs. Fixes #1586.
