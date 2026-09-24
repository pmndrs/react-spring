import React, { useState, useEffect } from 'react'
import { usePresenceList, animated } from '@react-spring/web'
import shuffle from 'lodash.shuffle'
import data from './data'

import styles from './styles.module.css'

function List() {
  const [rows, set] = useState(data)
  useEffect(() => {
    const t = setInterval(() => set(shuffle), 2000)
    return () => clearInterval(t)
  }, [])

  let height = 0
  const entries = usePresenceList(
    rows.map(data => ({ ...data, y: (height += data.height) - data.height })),
    {
      keys: item => item.name,
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      update: ({ y, height }) => ({ y, height }),
    }
  )

  return (
    <div className={styles.list} style={{ height }}>
      {entries.map(({ key, item, springs }, index) => (
        <animated.div
          key={key}
          className={styles.card}
          style={{ zIndex: data.length - index, ...springs }}
        >
          <div className={styles.cell}>
            <div
              className={styles.details}
              style={{ backgroundImage: item.css }}
            />
          </div>
        </animated.div>
      ))}
    </div>
  )
}

export default function App() {
  return <List />
}
