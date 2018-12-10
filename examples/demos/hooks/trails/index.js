import React, { useState } from 'react'
import { render } from 'react-dom'
import range from 'lodash/range'
import { useTrail, animated } from 'react-spring/hooks'
import './styles.css'

export default function Trail() {
  const [toggle, setToggle] = useState(true)
  const [items] = useState(['🍎', '🍊', '🥝', '🍌', '🍒'])
  const [trail] = useTrail({
    items,
    opacity: toggle ? 1 : 0.25,
    x: toggle ? 0 : 100,
    from: { opacity: 0, x: -100 },
  })

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}>
      {trail.map(({ item, props }) => (
        <animated.div
          className="trails-box"
          key={item}
          onClick={() => setToggle(!toggle)}
          style={{
            opacity: props.opacity,
            transform: props.x.interpolate(x => `translate3d(${x}%,0,0)`),
          }}>
          {item}
        </animated.div>
      ))}
    </div>
  )
}
