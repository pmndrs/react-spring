import React, { useEffect, useState } from 'react'
import { useTrail, animated, useKeyframes } from '../../src/targets/web/hooks'
import { testStories } from '../index'
import range from 'lodash/range'
import './styles.css'

function TestTrail () {
  const [toggle, setToggle] = useState(false)
  const [items, setState] = useState(range(5))
  const trail = useTrail(items.length, {
    from: { opacity: 0, x: -100 },
    to: { opacity: toggle ? 1 : 0.25, x: toggle ? 0 : 100 }
  })

  return (
    <div class='container'>
      {trail.map((props, idx) => (
        <animated.div
          class='box'
          key={items[idx]}
          onClick={() => setToggle(!toggle)}
          style={{
            opacity: props.opacity,
            transform: props.x.interpolate(x => `translate3d(${x}%,0,0)`)
          }}
        >
          {items[idx]}
        </animated.div>
      ))}
    </div>
  )
}

testStories.add('Trail Hook', () => <TestTrail />)

const states = {
  start: {
    from: { opacity: 0, x: -100 },
    opacity: 0.25,
    x: 100
  },
  end: {
    opacity: 1,
    x: 0
  }
}

const useKeyframedTrail = useKeyframes.trail(states)

function TestKeyframeTrail () {
  const [toggle, setToggle] = useState(true)
  const items = range(5)
  const trail = useKeyframedTrail(items.length, toggle ? 'start' : 'end')
  return (
    <div class='container'>
      {trail.map((props, idx) => (
        <animated.div
          class='box'
          key={items[idx]}
          onClick={() => setToggle(!toggle)}
          style={{
            opacity: props.opacity,
            transform: props.x.interpolate(x => `translate3d(${x}%,0,0)`)
          }}
        >
          {items[idx]}
        </animated.div>
      ))}
    </div>
  )
}

testStories.add('Trail Hook Keyframes', () => <TestKeyframeTrail />)
