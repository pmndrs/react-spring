import React, { useState } from 'react'
import { render } from 'react-dom'
import range from 'lodash/range'
import { useTrail, animated } from 'react-spring/hooks'
import './styles.css'

const items = ['Lorem', 'ipsum', 'dolor', 'sit']

export default function Trail() {
  const [toggle, set] = useState(true)
  const [trail] = useTrail({
    items,
    opacity: toggle ? 1 : 0,
    x: toggle ? 0 : 20,
    height: toggle ? 50 : 0,
    from: { opacity: 0, x: 20, height: 0 },
    config: { mass: 5, tension: 2000, friction: 200 },
    //reverse: !toggle
  })

  return (
    <div className="trails-main" onClick={() => set(state => !state)}>
      <div>
        {trail.map(({ item, props: { x, height, ...rest } }) => (
          <animated.div
            className="trails-box"
            key={item}
            style={{
              ...rest,
              transform: x.interpolate(x => `translate3d(0,${x}px,0)`),
            }}>
            <animated.div style={{ height }}>{item}</animated.div>
          </animated.div>
        ))}
      </div>
    </div>
  )
}
