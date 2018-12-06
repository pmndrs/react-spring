import React, { useEffect, useState } from 'react'
import { useTrail, animated, useTrailKeyframes } from '../../src/targets/web/hooks'
import { testStories } from '../index'
import range from 'lodash/range'
import './styles.css'

function TestTrail() {
  const [toggle, setToggle] = useState(false)
  const [items, setState] = useState(range(5))
  const [trail] = useTrail({
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

testStories.add('Trail Hook', () => <TestTrail />)

function TestKeyframeTrail() {
  const [toggle, setToggle] = useState(false)
  const [items, setState] = useState(range(5))
  const states = {
    start: {
      opacity:  0.25,
      x: 100
    },
    end: {
      opacity: 1,
      x: 0
    }
  }
  const trail = useTrailKeyframes({
    items,
    state: toggle ? 'start': 'end',
    states,
  },  { opacity: 0, x: -100 })

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

testStories.add('Trail Hook Keyframes', () => <TestKeyframeTrail />)
