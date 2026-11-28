---
'@react-spring/three': patch
---

Allow array springs on `animated` three.js props such as `position`, `rotation` and `scale`. A spring made from `[x, y, z]` now type-checks when it is passed to these props.
