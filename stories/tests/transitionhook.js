import React from 'react'
import { useTransition } from '../../src/targets/web/hooks'
import { animated } from '../../src/targets/web'
import { testStories } from '../index'

function rand (frm, to) {
  return ~~(Math.random() * (to - frm)) + frm
}

function createColors (length = 100) {
  let colors = []
  while (colors.length < length) {
    colors.push(`rgb(${rand(0, 255)}, ${rand(0, 255)}, ${rand(0, 255)})`)
  }

  return colors
}

function TestTransition () {
  const colors = createColors()
  const [state, setState] = React.useState({
    items: new Array(10).fill(0).map((_, idx) => colors[idx])
  })

  const renderedItems = useTransition({
    items: state.items,
    from: { x: 0, opacity: 0 },
    initial: { x: 1, opacity: 1 },
    // onRest: (...args) => console.log('values of on rest ', args),
    // onDestroyed: (...args) => console.log('this was destroyed ', ...args),
    enter: [
      { opacity: 0.3 },
      { x: 0.5, delay: 200 },
      { opacity: 0.5 },
      { x: 1, opacity: 1, delay: 1000 }
    ],
    leave: { x: 0, delay: 500 }
  })

  function renderItem ({ item, props, key }) {
    return (
      <animated.li
        key={key}
        onClick={() => {
          if (state.items.indexOf(item) > -1) {
            setState({
              ...state,
              items: state.items.filter(val => val !== item)
            })
          }
        }}
        style={{
          background: item,
          height: props.x
            .interpolate({
              range: [0, 1],
              output: [0, 300]
            })
            .interpolate(x => `${x}px`),
          opacity: props.opacity,
          overflow: 'hidden'
        }}
      >
        {item}
      </animated.li>
    )
  }

  const onAdd = () => {
    let newItems = [...state.items]
    newItems = [createColors(1)[0]].concat(newItems)
    setState({...state, items: newItems})
  }

  return (
    <React.Fragment>
      <button onClick={onAdd}>Add Item</button>
      <ul>{renderedItems.map(renderItem)}</ul>
    </React.Fragment>
  )
}

testStories.add('Transitions Hook', () => <TestTransition />)
