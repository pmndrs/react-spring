import React, { useEffect, useState } from 'react'
import { useTransition, animated } from '../../src/targets/web/hooks'
import { testStories } from '../index'
import './styles.css'

function TestTransition() {
  const [items, setState] = useState([])

  useEffect(() => {
    setState(['Apples', 'Oranges', 'Bananas'])
    setTimeout(() => setState(['Apples', 'Bananas']), 1500)
    setTimeout(() => setState(['Apples', 'Oranges', 'Bananas']), 3000)
    setTimeout(() => setState(['Kiwis']), 4500)
  }, [])

  const transitions = useTransition({
    items,
    from: { height: 0, opacity: 0 },
    enter: { height: 50, opacity: 1, background: '#28d79f' },
    leave: { height: 0, opacity: 0, background: '#c23369' },
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
