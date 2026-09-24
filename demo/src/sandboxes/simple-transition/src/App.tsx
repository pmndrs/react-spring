import * as React from 'react'
import { usePresenceList, animated, useSpringRef } from '@react-spring/web'

import styles from './styles.module.css'

const pages = [
  { label: 'A', background: 'lightpink' },
  { label: 'B', background: 'lightblue' },
  { label: 'C', background: 'lightgreen' },
]

export default function App() {
  const [index, set] = React.useState(0)
  const onClick = () => set(state => (state + 1) % 3)
  const transRef = useSpringRef()
  const entries = usePresenceList(index, {
    ref: transRef,
    keys: null,
    from: { opacity: 0, transform: 'translate3d(100%,0,0)' },
    enter: { opacity: 1, transform: 'translate3d(0%,0,0)' },
    leave: { opacity: 0, transform: 'translate3d(-50%,0,0)' },
  })
  React.useEffect(() => {
    transRef.start()
  }, [index, transRef])
  return (
    <div className={`flex fill ${styles.container}`} onClick={onClick}>
      {entries.map(({ key, item, springs }) => (
        <animated.div
          key={key}
          style={{ ...springs, background: pages[item].background }}
        >
          {pages[item].label}
        </animated.div>
      ))}
    </div>
  )
}
