---
'@react-spring/core': patch
---

Fix looping async `to` chains stalling after a declarative reissue. Loop
continuation is now decided by the async chain's own result instead of the
combined result of every promise in the update, so a reissued sequence keeps
looping instead of stopping after its first pass.
