import React, { useRef, useState, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import Controller from '../../../../src/animated/Controller'

export default function App() {
  const [toggle, set] = useState(false)
  const [ctrl0] = useState(
    () => new Controller({ from: { left: 0, background: 'red' } })
  )
  const [ctrl1] = useState(
    () => new Controller({ from: { left: 0, background: 'green' } })
  )
  const props1 = ctrl0.getValues()
  const props2 = ctrl1.getValues()

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <button
        onClick={async () => {
          ctrl0.update({ delay: 500, left: 400, background: 'hotpink' }).start()
          await new Promise(r => setTimeout(r, 250))
          ctrl0.update({ left: 200 }).start()
          //ctrl0.update({ left: 400 }).start()
        }}>
        Change speed
      </button>
      <animated.div
        style={{
          ...props1,
          position: 'relative',
          width: 50,
          height: 50,
          margin: 10,
        }}
      />
      <animated.div
        style={{
          ...props2,
          position: 'relative',
          width: 50,
          height: 50,
          margin: 10,
        }}
      />
    </div>
  )
}
