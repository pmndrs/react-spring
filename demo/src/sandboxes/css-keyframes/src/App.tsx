import React, { useState } from 'react'
import { useSpring, animated } from '@react-spring/web'
import styles from './styles.module.css'

/*
0 % { transform: scale(1); }
25 % { transform: scale(.97); }
35 % { transform: scale(.9); }
45 % { transform: scale(1.1); }
55 % { transform: scale(.9); }
65 % { transform: scale(1.1); }
75 % { transform: scale(1.03); }
100 % { transform: scale(1); }
`*/

export default function App() {
  const [state, toggle] = useState(true)
  const { x } = useSpring({
    from: { x: 0 },
    x: state ? 1 : 0,
    config: { duration: 1000 },
  })
  return (
    <div className={styles.container} onClick={() => toggle(!state)}>
      <animated.div
        className={styles.text}
        style={{
          opacity: x.to({ range: [0, 1], output: [0.3, 1] }),
          scale: x.to({
            range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
            output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1],
          }),
        }}>
        click
      </animated.div>
    </div>
  )
}
