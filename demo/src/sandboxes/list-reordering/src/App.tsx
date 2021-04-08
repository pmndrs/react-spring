import React, { useState, useEffect } from 'react'
import { useTransition, animated } from '@react-spring/web'
import shuffle from 'lodash-es/shuffle'
import data from './data'

import styles from './styles.module.css'

function List() {
  const [rows, set] = useState(data)
  useEffect(() => {
    const t = setInterval(() => set(shuffle), 2000)
    return () => clearInterval(t)
  }, [])

  let height = 0
  const transitions = useTransition(
    rows.map(data => ({ ...data, y: (height += data.height) - data.height })),
    {
      key: (item: any) => item.name,
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      update: ({ y, height }) => ({ y, height }),
    }
  )

  return (
    <div className={styles.list} style={{ height }}>
      {transitions((style, item, t, index) => (
        <animated.div className={styles.card} style={{ zIndex: data.length - index, ...style }}>
          <div className={styles.cell}>
            <div className={styles.details} style={{ backgroundImage: item.css }} />
          </div>
        </animated.div>
      ))}
    </div>
  )
}

export default function App() {
  return <List />
}
