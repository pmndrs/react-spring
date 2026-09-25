---
'@react-spring/core': minor
---

feat: add `usePresenceList` and `usePresence`, which return entries to render instead of a render function

`usePresenceList(items, props)` returns `{ key, item, springs, phase }` for every item, keeping removed items until their `leave` animation has finished. `usePresence(show, props)` does the same for a boolean and returns `{ springs, phase }` or `null`. Both accept a props function or `deps` and then return `[value, ref]`, like the other hooks.

The top-level `config` and `delay` are passed to each spring untouched, so `config: key => ...` and `delay: key => ...` are called with the spring's key (#2136). The `trail` offset is added to `delay`. Set item- or phase-specific values in the phase instead: `enter: (item, i) => ({ opacity: 1, config: ..., delay: ... })`.

`mode: 'wait'` adds new items only once every leaving item has finished, and works with lists.

`useTransition` and `<Transition>` are deprecated. To migrate:

```tsx
// before
const transitions = useTransition(items, {
  keys: item => item.id,
  exitBeforeEnter: true,
  ...props,
})
return transitions((style, item) => (
  <animated.div style={style}>{item.text}</animated.div>
))

// after
const entries = usePresenceList(items, {
  keys: item => item.id,
  mode: 'wait',
  ...props,
})
return entries.map(({ key, item, springs }) => (
  <animated.div key={key} style={springs}>
    {item.text}
  </animated.div>
))
```

Other differences from `useTransition`:

- Move `config: (item, index, phase) => ...` into `enter`, `update` or `leave`.
- A top-level `delay` function receives the spring key, not the item key. Move item-specific delays into the phase.
- Use `keys`; the singular `key` alias is not supported.
- `deps` only hold back `update`. Items still enter and leave when `data` changes and `deps` do not.
- `expires` only accepts a boolean.
- `onDestroyed` and a top-level `onResolve` are not accepted. `onResolve` inside a phase still works.
