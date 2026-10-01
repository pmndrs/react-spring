---
'@react-spring/shared': patch
---

fix(shared): match add/removeEventListener options in onScroll cleanup

`onScroll` added its scroll and resize listeners with `{ passive: true }` but removed them with no options. A shared options object is now passed to both the `addEventListener` and `removeEventListener` calls so they always match, preventing `useScroll` from leaking a scroll and resize listener per mount in environments that match listeners on the options object.
