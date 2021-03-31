import React from 'react'
import { useSpring, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'

import styles from './styles.module.css'

const bg1 = 'linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)'
const bg2 = 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)'

const Slider: React.FC = ({ children }) => {
  const [{ x, bg, size }, ref] = useSpring(() => ({ x: 0, bg: bg1, size: 1 }))
  const bind = useDrag(({ active, movement: [x] }) =>
    ref.set({
      x: active ? x : 0,
      bg: x < 0 ? bg2 : bg1,
      size: active ? 1.1 : 1,
      // immediate: name => active && name === 'x', // TODO this triggers an error atm
    })
  )

  const avSize = x.to({ map: Math.abs, range: [50, 300], output: [0.5, 1], extrapolate: 'clamp' })

  return (
    <animated.div {...bind()} className={styles.item} style={{ background: bg }}>
      <animated.div
        className={styles.av}
        style={{ scale: avSize, justifySelf: x.to(x => (x < 0 ? 'end' : 'start')) }}
      />
      <animated.div className={styles.fg} style={{ x, scale: size }}>
        {children}
      </animated.div>
    </animated.div>
  )
}

export default function App() {
  return (
    <div className="flex fill center">
      <Slider>Slide.</Slider>
    </div>
  )
}
