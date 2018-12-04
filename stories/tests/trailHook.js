import React, { useEffect, useState } from 'react'
import { useTrail, animated } from '../../src/targets/web/hooks'
import { testStories } from '../index'
import range from 'lodash/range'
import './styles.css'

function TestTransition() {
  const [toggle, setToggle] = useState(false)
  const [items, setState] = useState(range(5))

  const trail = useTrail({
    items,
    from: { opacity: 0, x: -100 },
    to: { opacity: toggle ? 1 : 0.25, x: toggle ? 0 : 100 },
  })

  return (
    <div class="container">
      {trail.map(({ item, props }) => (
        <animated.div
          class="box"
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

testStories.add('Trail Hook', () => <TestTransition />)
