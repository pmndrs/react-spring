import React from 'react'
import { useSpring, animated, config } from '@react-spring/web'
import styles from './styles.module.css'

export default function App() {
  const [{ background }, api] = useSpring(
    () => ({
      from: {
        background: 'var(--from)',
      },
      to: {
        background: 'var(--to)',
      },
      config: config.molasses,
      loop: {
        reverse: true,
      },
    }),
    []
  )

  return (
    <div className={styles.container}>
      <animated.div className={styles.block} style={{ background }} />
    </div>
  )
}
