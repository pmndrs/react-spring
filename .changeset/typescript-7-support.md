---
'@react-spring/core': patch
---

fix(core): support TypeScript 7

The `Controller` constructor's `flush` parameter was typed as `ControllerFlushFn<any>`. TypeScript 7 resolves that to a queue of `unknown`, which rejected valid flush functions, including the one `useSprings` passes internally. It's now typed as `ControllerFlushFn<Controller<any>>`, which behaves the same on every supported TypeScript version.
