import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { useTransition, animated, SpringRef } from '@react-spring/web'
function Demo({ name, factory, injected }) {
  const api = React.useMemo(() => SpringRef(), [])
  const counts = React.useRef({
    start: 0,
    change: 0,
    rest: 0,
    x: 0,
    opacity: 0,
  })
  const [view, setView] = React.useState({ ...counts.current })
  const props = React.useMemo(
    () => ({
      from: { x: 0, opacity: 0 },
      enter: { x: 240, opacity: 1 },
      config: { duration: 350 },
      ...(injected ? { ref: api } : {}),
      onStart: () => {
        counts.current.start++
        setView({ ...counts.current })
      },
      onChange: result => {
        counts.current.change++
        counts.current.x = result.value.x
        counts.current.opacity = result.value.opacity
        setView({ ...counts.current })
      },
      onRest: () => {
        counts.current.rest++
        setView({ ...counts.current })
      },
    }),
    []
  )
  const result = useTransition(true, factory ? () => props : props)
  const transition = Array.isArray(result) ? result[0] : result
  return (
    <section data-name={name}>
      <h2>{name}</h2>
      <div className="track">
        {transition(style => (
          <animated.div
            className="box"
            style={{
              opacity: style.opacity,
              transform: style.x.to(x => `translateX(${x}px)`),
            }}
          />
        ))}
      </div>
      <pre data-counts>{JSON.stringify(view)}</pre>
      {injected && (
        <button onClick={() => api.start()}>Start injected transition</button>
      )}
    </section>
  )
}
createRoot(document.getElementById('root')).render(
  <>
    <Demo name="Object control" factory={false} />
    <Demo name="Props factory" factory />
    <Demo name="Factory with injected ref" factory injected />
  </>
)
