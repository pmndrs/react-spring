import React, { useState, useEffect } from 'react'
import { useTransition, animated } from '@react-spring/web'
import styles from './styles.module.css'

const slides = [
  'photo-1544511916-0148ccdeb877',
  'photo-1544572571-ab94fd872ce4',
  'reserve/bnW1TuTV2YGcoh1HyWNQ_IMG_0207.JPG',
  'photo-1540206395-68808572332f',
]

export default function App() {
  const [index, set] = useState(0)
  const transitions = useTransition(index, {
    key: index,
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 3000 },
    onRest: (_a, _b, item) => {
      if (index === item) {
        set(state => (state + 1) % slides.length)
      }
    },
    exitBeforeEnter: true,
  })
  return (
    <div className="flex fill center">
      {transitions((style, i) => (
        <animated.div
          className={styles.bg}
          style={{
            ...style,
            backgroundImage: `url(https://images.unsplash.com/${slides[i]}?w=1920&q=80&auto=format&fit=crop)`,
          }}
        />
      ))}
    </div>
  )
}
