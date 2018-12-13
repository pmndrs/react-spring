import React, { useState, useCallback } from 'react'
import { render } from 'react-dom'
import { useTransition, animated } from 'react-spring/hooks'
import './styles.css'

const pages = [
  ({ style }) => <animated.div style={{ ...style, background: 'lightpink' }}>A</animated.div>,
  ({ style }) => <animated.div style={{ ...style, background: 'lightblue' }}>B</animated.div>,
  ({ style }) => <animated.div style={{ ...style, background: 'lightgreen' }}>C</animated.div>,
]

export default function App() {
  const [index, set] = useState(0)
  const onClick = useCallback(() => set(state => (state === 2 ? 0 : state + 1)), [])
  const transitions = useTransition({
    items: pages[index],
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
  })
  return (
    <div className="simple-trans-main" onClick={onClick}>
      {transitions.map(({ item: Page, props, key }) => (
        <Page key={key} style={props} />
      ))}
    </div>
  )
}
