import React, { useState } from 'react'
import { useSpring, animated } from 'react-spring'

export default function Test() {
  const [v, setV] = useState(1000)
  const [props] = useSpring({ width: v, from: { width: 0 }, config: { duration: 100 } })

  return (
    <React.Fragment>
      <animated.div
        style={{
          background: 'red',
          ...props
        }}>
        {props.width}
      </animated.div>
      <button onClick={() => setV(!v ? 1000 : 0)}>Click</button>
    </React.Fragment>
  )
}
