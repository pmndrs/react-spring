import React, { useState, useCallback } from 'react'
import { useSpring, animated as a } from 'react-spring/hooks'
import './styles.css'

export default function Card() {
  const [flipped, set] = useState(false)
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(1400px) rotateX(${flipped ? 180 : 0}deg)`,
    config: { mass: 6, tension: 500, friction: 80 },
  })
  return (
    <div className="flip-main" onClick={() => set(state => !state)}>
      <a.div
        className="flip-c flip-back"
        style={{ opacity: opacity.interpolate(o => 1 - o), transform }}
      />
      <a.div
        className="flip-c flip-front"
        style={{
          opacity,
          transform: transform.interpolate(t => `${t} rotateX(180deg)`),
        }}
      />
    </div>
  )
}
