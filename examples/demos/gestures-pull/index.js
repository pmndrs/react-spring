import React, { useState, useRef, useEffect } from 'react'
import clamp from 'lodash-es/clamp'
import { useGesture } from 'react-with-gesture'
import { useSpring, animated } from 'react-spring'
import { add, scale } from 'vec-la'
import './styles.css'

function Pull() {
  const [{ xy }, set] = useSpring(() => ({ xy: [0, 0] }))
  const bind = useGesture(({ down, delta, velocity }) => {
    velocity = Math.max(1, velocity)
    console.log(delta, velocity)
    set({
      xy: down ? delta : [0, 0],
      config: { mass: velocity, tension: 500 * velocity, friction: 50 },
    })
  })
  return (
    <animated.div
      {...bind()}
      style={{
        transform: xy.interpolate((x, y) => `translate3d(${x}px,${y}px,0)`),
      }}
    />
  )
}

export default function App() {
  return (
    <div className="main-gestures">
      <Pull />
    </div>
  )
}
