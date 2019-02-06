import React, { useRef, useState } from 'react'
import { useSpring, animated } from 'react-spring'
import useKnobs from './useKnobs'
import './styles.css'

const calc = (x, y, rect) => [
  -(y - rect.top - rect.height / 2) / 5,
  (x - rect.left - rect.width / 2) / 5,
  1.4,
]
const trans = (x, y, s) =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`

export default function Card() {
  const ref = useRef(null)
  const [xys, set] = useState([0, 0, 1])
  const [config, knobs] = useKnobs({ mass: 1, tension: 170, friction: 26 })
  const props = useSpring({ xys, config })

  return (
    <div className="ccard-main" ref={ref}>
      {knobs}
      <animated.div
        className="ccard"
        style={{ transform: props.xys.interpolate(trans) }}
        onMouseLeave={() => set([0, 0, 1])}
        onMouseMove={e => {
          const rect = ref.current.getBoundingClientRect()
          set(calc(e.clientX, e.clientY, rect))
        }}
      />
    </div>
  )
}
