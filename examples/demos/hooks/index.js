import React, { useState, useEffect } from 'react'
import { animated as anim, interpolate, useSpring } from 'react-spring'
import { unstable_scheduleCallback as defer } from 'scheduler'
import './styles.css'

const fast = { tension: 230, friction: 10 }
const slow = { mass: 10, tension: 20, friction: 10 }
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`

export default function Goo() {
  const [mouse, setCoords] = useState([500, 500])
  const { pos1 } = useSpring({ pos1: mouse, config: fast })
  const { pos2 } = useSpring({ pos2: pos1, config: slow })
  const { pos3 } = useSpring({ pos3: pos2, config: slow })

  useEffect(() => {
    const handler = ({ clientX, clientY }) =>
      defer(() => setCoords([clientX, clientY]))
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <div class="hooks-main">
      <div class="hooks-filter">
        <anim.div class="b3" style={{ transform: interpolate(pos3, trans) }} />
        <anim.div class="b2" style={{ transform: interpolate(pos2, trans) }} />
        <anim.div class="b1" style={{ transform: interpolate(pos1, trans) }} />
      </div>
      <svg>
        <filter id="goo">
          <feGaussianBlur stdDeviation="30" />
          <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7" />
        </filter>
      </svg>
    </div>
  )
}
