import React, { useState, useEffect } from 'react'
import { useTransition, animated as a, config } from 'react-spring'
import shuffle from 'lodash/shuffle'
import { useMeasure, useMedia } from './helpers'
import data from './data'
import './styles.css'

export default function App() {
  const columns = 6
  const [bind, { width }] = useMeasure()
  const [items, set] = useState(data)

  let heights = new Array(columns).fill(0)
  let gridItems = items.map((child, i) => {
    const column = heights.indexOf(Math.min(...heights))
    const xy = [
      (width / columns) * column,
      (heights[column] += child.height / 2) - child.height / 2,
    ]
    return { ...child, xy, width: width / columns, height: child.height / 2 }
  })

  const transitions = useTransition(gridItems, item => item.css, {
    from: ({ xy, width, height }) => ({ xy, width, height, opacity: 0 }),
    enter: ({ xy, width, height }) => ({ xy, width, height, opacity: 1 }),
    update: ({ xy, width, height }) => ({ xy, width, height }),
    leave: { height: 0, opacity: 0 },
    config: config.stiff,
    trail: 25,
  })

  useEffect(() => void setInterval(() => set(shuffle), 2000), [])

  return (
    <div className="mgrid">
      <div {...bind} className="mgrid-list">
        {transitions.map(({ item, props: { xy, ...rest }, key }) => (
          <a.div
            key={key}
            style={{
              transform: xy.interpolate(
                (x, y) => `translate3d(${x}px,${y}px,0)`
              ),
              ...rest,
            }}>
            <div style={{ backgroundImage: item.css }} />
          </a.div>
        ))}
      </div>
    </div>
  )
}
