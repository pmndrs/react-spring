import * as React from 'react'
import { useWindowSize } from './hooks/useWindowSize'

import styles from './styles.module.scss'

const STROKE_WIDTH = 0.5

const Y_LINES = 20
const X_LINES = 10

const PAGE_COUNT = 5

export default function App() {
  const [width, height] = useWindowSize()

  return (
    <div className={styles.body}>
      <svg className={styles.grid__container} viewBox={`0 0 ${width} ${height}`}>
        {new Array(X_LINES)
          .fill(null)
          .map((_, index) =>
            index === 0 ? null : (
              <line
                x1={0}
                y1={index * (height / X_LINES)}
                x2={width}
                y2={index * (height / X_LINES)}
                key={index}
                strokeWidth={STROKE_WIDTH}
                stroke="currentColor"
              />
            )
          )}
        {new Array(Y_LINES)
          .fill(null)
          .map((_, index) =>
            index === 0 ? null : (
              <line
                x1={index * (width / Y_LINES)}
                y1={0}
                x2={index * (width / Y_LINES)}
                y2={height}
                key={index}
                strokeWidth={STROKE_WIDTH}
                stroke="currentColor"
              />
            )
          )}
      </svg>
      {new Array(PAGE_COUNT).fill(null).map((_, index) => (
        <div className={styles.full__page} />
      ))}
    </div>
  )
}
