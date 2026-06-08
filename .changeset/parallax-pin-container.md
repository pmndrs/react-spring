---
'@react-spring/parallax': patch
---

Pin the `Parallax` container to its top-left corner (`top: 0; left: 0`). The container is `position: absolute` but previously set no offsets, so it inherited its static position. Host layouts that shift that position — such as the `place-items: center` in Vite's default `index.css` — pushed the viewport-height container below the viewport, giving the document its own scrollbar on top of the container's, hence the "double scrollbar". Closes #2255.
