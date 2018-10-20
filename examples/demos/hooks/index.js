import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { animated as anim, useSpring } from 'react-spring'
import { unstable_scheduleCallback as defer } from 'scheduler'
import './styles.css'

const fast = { tension: 1200, friction: 40 }
const slow = { mass: 10, tension: 200, friction: 50 }
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`

export default function Goo() {
  // Store for mouse coordenates
  const [mouse, setCoords] = useState([500, 500])
  // Picks up coordinates and forms a natural trail, one spring following another
  const { pos1 } = useSpring({ pos1: mouse, config: fast })
  const { pos2 } = useSpring({ pos2: pos1, config: slow })
  const { pos3 } = useSpring({ pos3: pos2, config: slow })
  // Effect for fetching mouse coordinates
  useEffect(() => {
    const handler = ({ clientX, clientY }) => defer(() => setCoords([clientX, clientY]))
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return (
    <React.unstable_ConcurrentMode>
      <div class="hooks-main">
        <p>
          <span>react</span>
          <span></span>
          <span>spring</span>
          <span>6</span>
        </p>
        <div class="hooks-filter">
          <anim.div class="b1" style={{ transform: pos3.interpolate(trans) }} />
          <anim.div class="b2" style={{ transform: pos2.interpolate(trans) }} />
          <anim.div class="b3" style={{ transform: pos1.interpolate(trans) }} />
        </div>
        <svg>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
            <feColorMatrix in="blur" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7" />
          </filter>
        </svg>
      </div>
    </React.unstable_ConcurrentMode>
  )
}
