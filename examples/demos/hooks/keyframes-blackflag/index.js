import React from 'react'
import { useKeyframes, animated } from 'react-spring/hooks'
import range from 'lodash-es/range'
import './styles.css'

const items = range(4)
const interp = i => r =>
  `translate3d(0, ${15 * Math.sin(r + (i * 2 * Math.PI) / 1.6)}px, 0)`
const useScript = useKeyframes.spring({
  test: async next => {
    while (1)
      await next({
        radians: 2 * Math.PI,
        from: { radians: 0 },
        config: { duration: 3500 },
        reset: true,
      })
  },
})

export default function App() {
  const props = useScript('test')
  return props.radians ? (
    <div className="script-bf-main">
      {items.map(i => (
        <animated.div
          key={i}
          className="script-bf-box"
          style={{ transform: props.radians.interpolate(interp(i)) }}
        />
      ))}
    </div>
  ) : null
}
