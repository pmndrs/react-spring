import React, { useState, useEffect } from 'react'
import { useTransition, animated } from 'react-spring/hooks'
import './styles.css'

export default function MultiStageTransition() {
  const [items, setState] = useState([])
  const transitions = useTransition({
    items,
    from: { opacity: 0, height: 0, transform: 'scale(1)', background: 'black' },
    enter: [{ opacity: 1, height: 100 }, { transform: 'scale(1.2)', background: '#28d79f' }, { transform: 'scale(1)' }],
    leave: [{ background: '#c23369' }, { opacity: 0 }, { height: 0 }],
    update: { background: '#28b4d7' },
  })

  useEffect(() => {
    setState(['🍎 Apples', '🍊 Oranges', '🥝 Kiwis'])
    setTimeout(() => setState(['🍎 Apples', '🥝 Kiwis']), 3000)
    setTimeout(() => setState(['🍎 Apples', '🍌 Bananas', '🥝 Kiwis']), 6000)
  }, [])

  return transitions.map(({ item, props, key }) => (
    <animated.div className="transitions-item" key={key} style={props}>
      {item}
    </animated.div>
  ))
}