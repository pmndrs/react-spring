---
'@react-spring/core': major
---

fix!: useTransition reads default props returned by a props function

When useTransition received a props function, it read default props from the function instead of the object it returned. Animations could finish without calling the declared lifecycle handlers. It now reads defaults from the already evaluated props object, as the object form does.

Breaking: factory-level onProps, onStart, onChange, onPause, onResume and onRest handlers can now run when their events occur. Explicit inherited configuration and other custom defaults are also applied. Applications that worked around the missing handlers should check for duplicate side effects. Phase-specific values still take precedence. Injected refs still wait for an explicit start, and this change does not call the props function more often. The newer usePresence and usePresenceList hooks are unchanged.
