---
'@react-spring/parallax': major
---

fix!: sticky `ParallaxLayer`s now stay in view when rendered from inside a component or wrapper

`Parallax` decided where each layer went by reading `child.props.sticky` on its direct children (and inside fragments), so a sticky layer rendered by a component or wrapped in a `div` landed in the scrolling content and vanished between `start` and `end`. Sticky layers now portal themselves into the scroll container, so they work however they're nested. Fixes #2052.

**Breaking:** a sticky layer wrapped in your own markup is now rendered outside that wrapper in the DOM. Styles that relied on the wrapper (descendant selectors, inherited styles, positioning relative to a positioned wrapper) and native DOM listeners on the wrapper no longer apply to it. React event handlers on the wrapper still receive its events. Style the layer directly instead.
