---
'@react-spring/core': major
---

fix!: `ref.start(props)` now uses the `config` and event handlers declared in `useSpring`/`useSprings`

With a `ref`, the declarative update is postponed until `ref.start()` is called. Its implicit default props (`config`, `onStart`, `onChange`, `onRest`, ...) were postponed with it, so calling `ref.start(props)` (which skips the postponed update) animated with the default config and never called the declared handlers. The defaults are now applied on commit, the same as without a `ref`. Fixes #2186.

**Breaking:** if you declare `config` or event handlers in `useSpring`/`useSprings` with a `ref` and start animations with `ref.start(props)`, those animations now use the declared `config` and call the declared handlers. A `config` or handler passed to `ref.start(props)` still takes precedence.
