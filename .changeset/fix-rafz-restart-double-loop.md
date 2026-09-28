---
'@react-spring/rafz': patch
---

fix(rafz): run a single frame loop when an animation starts just after the loop went idle

Starting an animation between the frame where the loop went idle and the next one booked a second loop beside the one still scheduled, so every spring ticked twice per frame until everything came to rest: physics springs ran fast and duration springs could report a `NaN` velocity.
