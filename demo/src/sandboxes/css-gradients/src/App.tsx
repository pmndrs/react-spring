import * as React from 'react'
import { cubicCoordinates, stepsCoordinates } from 'easing-coordinates'
import { useSpring, animated, to as interpolate, createInterpolator } from '@react-spring/web'
import { useControls } from 'leva'

import styles from './styles.module.css'

const easeMap = {
  'ease-in-out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  'ease-out': { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  'ease-in': { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  ease: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  linear: { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 },
}

export default function App() {
  const { from, mid, to, angle, stops, easeCustom, easing } = useControls({
    from: '#0bd1ff',
    mid: '#ffa3ff',
    to: '#ffd34e',
    angle: {
      value: 32,
      min: 0,
      max: 360,
    },
    stops: {
      value: 5,
      max: 100,
      min: 2,
    },
    easing: {
      value: 'ease-in-out',
      options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'steps'],
    },
    easeCustom: '',
  })

  const { colorFrom, colorMid, colorTo } = useSpring({
    colorFrom: from,
    colorMid: mid,
    colorTo: to,
  })

  const coordinates = React.useMemo(() => {
    let coordinates
    const customBezier = easeCustom.split(',').map(Number)
    if (customBezier.length <= 1) {
      if (easing === 'steps') {
        coordinates = stepsCoordinates(stops, 'skip-none')
      } else {
        const { x1, y1, x2, y2 } = easeMap[easing]
        coordinates = cubicCoordinates(x1, y1, x2, y2, stops)
      }
    } else {
      coordinates = cubicCoordinates(customBezier[0], customBezier[1], customBezier[2], customBezier[3], stops)
    }

    return coordinates
  }, [easing, easeCustom, stops])

  const allStops = interpolate([colorFrom, colorMid, colorTo], (from, mid, to) => {
    const blend = createInterpolator({ range: [0, 0.5, 1], output: [from, mid, to] })

    return coordinates.map(({ x, y }) => {
      const color = blend(y)

      return `${color} ${x * 100}%`
    })
  })

  return (
    <animated.div
      className={styles.container}
      style={{
        backgroundImage: allStops.to((...args) => `linear-gradient(${angle}deg, ${args.join(', ')})`),
      }}
    />
  )
}
