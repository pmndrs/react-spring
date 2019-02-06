import React, { useState } from 'react'
import { useTransition, animated } from 'react-spring'
import ReactDOM from 'react-dom'

export default function App() {
  const [open, setOpen] = useState(false)
  const transitions = useTransition(open, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const a = transitions.map(
    ({ item, key, props }) =>
      item && (
        <animated.div key={key} style={{ opacity: props.opacity }}>
          Hello
        </animated.div>
      )
  )
  console.log('----', a)

  return (
    <div>
      <button
        onClick={() => {
          setOpen(!open)
        }}>
        click
      </button>
      {a}
    </div>
  )
}
