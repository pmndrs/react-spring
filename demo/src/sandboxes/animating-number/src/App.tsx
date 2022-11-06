import React, { useState } from 'react'
import { useSpring, a } from '@react-spring/web'

import styles from './styles.module.css'

const AnimateNumber: React.FC<{ from: int; to: int; delay: int; isReset: bool; customStyle: unknown }> = ({
  from = 0,
  to = 100,
  delay = 100,
  isReset = true,
  customStyle = {},
}) => {
  const [flip, set] = useState(false)
  const { number } = useSpring({
    reset: isReset,
    reverse: flip,
    from: { number: from },
    number: to,
    delay,
    onRest: () => set(!flip),
  })
  return (
    <a.div className={styles.number} style={customStyle}>
      {number.to(n => n.toFixed(0))}
    </a.div>
  )
}

export default function App({ demos }) {
  const [open, set] = useState(true)
  const demosList = demos ? demos.map((demo, index) => <AnimateNumber {...demo} />) : null
  return (
    <div className={styles.container} style={{ flexDirection: 'column' }} onClick={() => set(state => !state)}>
      {demosList}
    </div>
  )
}
