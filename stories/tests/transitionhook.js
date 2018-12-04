import React, { useEffect, useState } from 'react'
import { useTransition, animated } from '../../src/targets/web/hooks'
import { testStories } from '../index'
import './styles.css'

function TestTransition() {
  const [items, setState] = useState([])

  useEffect(() => {
    setState(['😅', '🚀', '🎉'])
    setTimeout(() => setState(['😅', '🎉']), 2500)
    setTimeout(() => setState(['😅', '✨', '🎉']), 5000)
  }, [])

  const transitions = useTransition({
    items,
    from: { opacity: 0, height: 0, transform: 'scale(1)' },
    enter: [{ opacity: 1, height: 50 }, { transform: 'scale(1.25)' }],
    leave: [
      { transform: 'scale(1)', opacity: 0.5 },
      { opacity: 0 },
      { height: 0 },
    ],
  })

  return (
    <div class="container">
      {transitions.map(({ item, props, key }) => (
        <animated.div class="item" key={key} style={props}>
          {item}
        </animated.div>
      ))}
    </div>
  )
}

testStories.add('Transitions Hook', () => <TestTransition />)
