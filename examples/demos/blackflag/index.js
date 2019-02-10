import React from 'react'
import { useSpring, animated } from 'react-spring'
import range from 'lodash-es/range'
import './styles.css'

const items = range(4)
const interp = i => r =>
  `translate3d(0, ${15 * Math.sin(r + (i * 2 * Math.PI) / 1.6)}px, 0)`

export default function App() {
  const props = useSpring({
    to: async next => {
      while (1) await next({ radians: 2 * Math.PI })
    },
    from: { radians: 0 },
    reset: true,
    config: { duration: 3500 },
  })
  return (
    <div className="script-bf-main">
      {items.map(i => (
        <animated.div
          key={i}
          className="script-bf-box"
          style={{ transform: props.radians.interpolate(interp(i)) }}
        />
      ))}
    </div>
  )
}
