import React, { useState, useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { animated as anim, interpolate, useSpring } from 'react-spring'
import { unstable_scheduleCallback as defer } from 'scheduler'
import './styles.css'

const fast = { tension: 230, friction: 10 }
const slow = { mass: 10, tension: 20, friction: 10 }
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`

export default function Goo() {
  // Mouse coordenates
  const [mouse, setCoords] = useState([500, 500])
  // Picks up coordinates and forms a natural trail, one spring following another
  const { pos1 } = useSpring({ pos1: mouse, config: fast })
  const { pos2 } = useSpring({ pos2: pos1, config: slow })
  const { pos3 } = useSpring({ pos3: pos2, config: slow })
  // Creates a set of persistent interpolators (so we don't re-create them every render)
  const [[t1, t2, t3]] = useState([pos1, pos2, pos3].map(p => interpolate(p, trans)))

  useEffect(() => {
    const handler = ({ clientX, clientY }) =>
      defer(() => setCoords([clientX, clientY]))
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <React.unstable_ConcurrentMode>
      <div class="hooks-main">
        <div class="hooks-filter">
          <anim.div class="b3" style={{ transform: t1 }} />
          <anim.div class="b2" style={{ transform: t2 }} />
          <anim.div class="b1" style={{ transform: t3 }} />
        </div>
        <svg>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation="30"
            />
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7"
            />
          </filter>
        </svg>
      </div>
    </React.unstable_ConcurrentMode>
  )
}
