---
'@react-spring/core': patch
---

fix(core): run async script `to` to completion under `skipAnimation` so the spring lands at the script's final value rather than being skipped entirely (#1429)
