---
'@react-spring/core': patch
---

Keep looping an async `to` after a re-render restarts it mid-sequence, and resolve the restarted sequence as finished once it completes.
