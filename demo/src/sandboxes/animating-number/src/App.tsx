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

export default function App(props) {
  const [open, set] = useState(true)
  return (
    <div className={styles.container} style={{ height: 40 }} onClick={() => set(state => !state)}>
      <AnimateNumber {...props} />
    </div>
  )
}
