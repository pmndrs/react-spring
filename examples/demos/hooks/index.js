import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useSpring, animated as anim } from 'react-spring'
import './styles.css'

const fast = { tension: 1200, friction: 40 }
const slow = { mass: 10, tension: 200, friction: 50 }
const trans = (x, y) => `translate3d(${x}px,${y}px,0) translate3d(-50%,-50%,0)`

export default function Goo() {
  // Here we form a natural trail, one spring following another.
  // You can either update springs by overwriting values when you re-render the component.
  // Or you can use the set function, which allows you to bypass React alltogether.
  // We're dealing with mouse-input here so we choose the latter in order to prevent rendering.
  const [{ pos1 }, set] = useSpring({ pos1: [0, 0], config: fast })
  const [{ pos2 }] = useSpring({ pos2: pos1, config: slow })
  const [{ pos3 }] = useSpring({ pos3: pos2, config: slow })
  // Effect for fetching mouse coordinates
  useEffect(() => {
    // "set" updates the first spring, the other springs are bound and will follow.
    // It won't cause a new render pass and the animated values down in the view
    // will still naturally reflect animated changes.
    const handler = ({ clientX, clientY }) => set({ pos1: [clientX, clientY] })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  // We render the view like always, but we're using animated.el whereever
  // animated values are being used. Just like with regular "native" springs this
  // makes elements transient.
  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="goo">
          <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="30" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -7"
          />
        </filter>
      </svg>
      <div class="hooks-main">
        <p>
          <span>react</span>
          <span></span>
          <span>spring</span>
          <span>hooked</span>
        </p>
        <div class="hooks-filter">
          <anim.div class="b1" style={{ transform: pos3.interpolate(trans) }} />
          <anim.div class="b2" style={{ transform: pos2.interpolate(trans) }} />
          <anim.div class="b3" style={{ transform: pos1.interpolate(trans) }} />
        </div>
      </div>
    </>
  )
}
