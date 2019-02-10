import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { useMeasure } from '../masonry-grid/helpers'
import './styles.css'

export default function App() {
  const [open, toggle] = useState(false)
  const [bind, { width }] = useMeasure()
  const props = useSpring({ width: open ? width : 0 })
  return (
    <div className="auto-container" {...bind} onClick={() => toggle(!open)}>
      <animated.div className="auto-fill" style={props} />
      <animated.div className="auto-content">
        {props.width.interpolate(x => `${x.toFixed(0)}px`)}
      </animated.div>
    </div>
  )
}
