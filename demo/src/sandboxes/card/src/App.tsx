import React from 'react'
import { useSpring, animated } from '@react-spring/web'

import './index.css'

const calc = (x: number, y: number) => [
  -(y - window.innerHeight / 2) / 20,
  (x - window.innerWidth / 2) / 20,
  1.1,
]
const trans = (x: number, y: number, s: number) =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`

export default function App() {
  const [props, ref] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 5, tension: 350, friction: 40 },
  }))
  return (
    <animated.div
      className="card"
      onMouseMove={({ clientX: x, clientY: y }) => {
        ref.current[0].set({ xys: calc(x, y) })
      }}
      onMouseLeave={() => {
        ref.current[0].set({ xys: [0, 0, 1] })
      }}
      style={{ transform: props.xys.to(trans) }}
    />
  )
}
