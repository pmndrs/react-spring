import React, { useState, useCallback, useEffect } from 'react'
import { useSprings, useTransition, animated } from 'react-spring'
import './styles.css'

const pages = [
  ({ style }) => (
    <animated.div style={{ ...style, background: 'lightpink' }}>A</animated.div>
  ),
  ({ style }) => (
    <animated.div style={{ ...style, background: 'lightblue' }}>B</animated.div>
  ),
  ({ style }) => (
    <animated.div style={{ ...style, background: 'lightgreen' }}>
      C
    </animated.div>
  ),
]

export default function App() {
  //const [, fU] = useState()
  // It should not matter if the component is re-rendered, it shouldn't drop out of sync
  //useEffect(() => void setInterval(fU, 100), [])

  const [index, set] = useState(0)
  const onClick = useCallback(
    () => set(state => (state === 2 ? 0 : state + 1)),
    []
  )
  const transitions = useTransition(index, null, {
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    initial: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
    //unique: true,
    //reset: true,
  })

  return (
    <div className="simple-trans-main" onClick={onClick}>
      {transitions.map(({ item, props, key }) => {
        const Page = pages[item]
        return <Page key={key} style={props} />
      })}
    </div>
  )
}
