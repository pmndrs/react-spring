import React, { useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import './styles.css'

const calc = (x, y, rect) => [
  -(y - rect.top - rect.height / 2) / 20,
  (x - rect.left - rect.width / 2) / 20,
  1.1,
]
const trans = (x, y, s) =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`

export default function Card() {
  const ref = useRef(null)
  const [props, set] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 5, tension: 350, friction: 40 },
  }))

  return (
    <div className="card-main" ref={ref}>
      <animated.div
        className="card"
        style={{ transform: props.xys.interpolate(trans) }}
        onMouseLeave={() => set({ xys: [0, 0, 1] })}
        onMouseMove={e => {
          const rect = ref.current.getBoundingClientRect()
          set({ xys: calc(e.clientX, e.clientY, rect) })
        }}
      />
    </div>
  )
}
