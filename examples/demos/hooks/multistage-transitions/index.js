import React, { useRef, useState, useEffect } from 'react'
import { useTransition, animated } from 'react-spring/hooks'
import './styles.css'

export default function MultiStageTransition() {
  const ref = useRef([])
  const [items, set] = useState([])
  const transitions = useTransition({
    items,
    from: { opacity: 0, height: 0, transform: 'scale(1)', color: '#575757' },
    enter: [
      { opacity: 1, height: 100 },
      { transform: 'scale(1.2)', color: '#28d79f' },
      { transform: 'scale(1)' },
    ],
    leave: [{ color: '#c23369' }, { opacity: 0 }, { height: 0 }],
    update: { color: '#28b4d7' },
  })

  useEffect(() => {
    ref.current.map(clearTimeout)
    set(['🍎 Apples', '🍊 Oranges', '🥝 Kiwis'])
    ref.current.push(setTimeout(() => set(['🍎 Apples', '🥝 Kiwis']), 3000))
    ref.current.push(setTimeout(() => set(['🍎 Apples', '🍌 Bananas', '🥝 Kiwis']), 6000))
  }, [])

  return transitions.map(({ item, props, key }) => (
    <animated.div
      className="transitions-item"
      key={key}
      style={props}
      onClick={() => {
        ref.current.map(clearTimeout)
        set([])
        ref.current.push(setTimeout(() => set(['🍎 Apples', '🍊 Oranges', '🥝 Kiwis']), 2000))
        ref.current.push(setTimeout(() => set(['🍎 Apples', '🥝 Kiwis']), 4000))
        ref.current.push(setTimeout(() => set(['🍎 Apples', '🍌 Bananas', '🥝 Kiwis']), 6000))
      }}>
      {item}
    </animated.div>
  ))
}
