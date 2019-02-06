import React, { useRef } from 'react'
import { useSpring, useTrail, animated as anim } from 'react-spring'
import './styles.css'

const fast = { tension: 1200, friction: 40 }
const slow = { mass: 10, tension: 200, friction: 50 }
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`

export default function Goo() {
  const ref = useRef(null)
  const [trail, set] = useTrail(3, () => ({
    xy: [0, 0],
    config: i => (i === 0 ? fast : slow),
  }))

  console.log(trail)

  return (
    <div
      ref={ref}
      className="goo-main"
      onMouseMove={e => {
        const rect = ref.current.getBoundingClientRect()
        set({ xy: [e.clientX - rect.left, e.clientY - rect.top] })
      }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7"
          />
        </filter>
      </svg>
      <div className="hooks-main">
        <div className="hooks-filter">
          {trail.map((props, index) => (
            <anim.div
              key={index}
              style={{ transform: props.xy.interpolate(trans) }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
