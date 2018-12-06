// complex transition
import React, { useEffect, useState, Component } from 'react'
import { useTransition, animated } from '../../src/targets/web/hooks'
import { testStories } from '../index'
import shuffle from 'lodash/shuffle'

import './complex.css'

const data = [
  {
    name: 'Rare Wind',
    description: '#a8edea → #fed6e3',
    css: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    height: 150
  },
  {
    name: 'Saint Petersburg',
    description: '#f5f7fa → #c3cfe2',
    css: 'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
    height: 300
  },
  {
    name: 'Deep Blue',
    description: '#e0c3fc → #8ec5fc',
    css: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    height: 200
  },
  {
    name: 'Ripe Malinka',
    description: '#f093fb → #f5576c',
    css: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    height: 200
  },
  {
    name: 'Near Moon',
    description: '#5ee7df → #b490ca',
    css: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    height: 300
  },
  {
    name: 'Wild Apple',
    description: '#d299c2 → #fef9d7',
    css: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    height: 150
  },
  {
    name: 'Ladoga Bottom',
    description: '#ebc0fd → #d9ded8',
    css: 'linear-gradient(135deg, #ebc0fd 0%, #d9ded8 100%)',
    height: 200
  },
  {
    name: 'Sunny Morning',
    description: '#f6d365 → #fda085',
    css: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    height: 200
  },
  {
    name: 'Lemon Gate',
    description: '#96fbc4 → #f9f586',
    css: 'linear-gradient(to top, #96fbc4 0%, #f9f586 100%)',
    height: 400
  }
]

export function List ({ children, config, items, keys, heights, ...rest }) {
  let totalHeight = 0
  let displayData = React.useMemo(
    () =>
      items.map(child => {
        let y = totalHeight
        let height = heights(child)
        totalHeight += height
        return { y, height, key: keys(child), child }
      }),
    [items]
  )

  const transitions = useTransition({
    items: displayData,
    keys: d => d.key,
    initial: null,
    // if from doesn't contain y it crashes
    from: { height: 0, opacity: 0 },
    leave: { height: 0, opacity: 0 },
    enter: ({ y, height }) => ({ y, height, opacity: 1 }),
    update: ({ y, height }) => {
      return { y, height }
    },
    config,
    trail: 100
  })

  // // something in useTransition causes an infinite loop

  return (
    <div
      style={{ position: 'relative', width: '100%', height: totalHeight }}
      {...rest}
    >
      {transitions.map(({ item, props, key }, index) => (
        <animated.div
          key={key}
          style={{
            position: 'absolute',
            willChange: 'transform, height, opacity',
            width: '100%',
            opacity: props.opacity,
            height: props.height,
            zIndex: displayData.length - index,
            transform: props.y.interpolate(y => `translate3d(0,${y}px,0)`)
          }}
          children={children(item.child)}
        />
      ))}
    </div>
  )
}

export class App extends Component {
  state = { data }
  shuffle = () => this.setState(state => ({ data: shuffle(state.data) }))
  componentDidMount () {
    setInterval(this.shuffle, 2500)
  }
  render () {
    return (
      <div id='complex'>
        <List
          className='main-list'
          items={this.state.data}
          keys={d => d.name}
          heights={d => d.height}
          config={{ mass: 3, tension: 100, friction: 40 }}
        >
          {item => (
            <div className='cell'>
              <div className='details' style={{ backgroundImage: item.css }}>
                <h1>{item.name}</h1>
                <p>{item.description}</p>
              </div>
            </div>
          )}
        </List>
      </div>
    )
  }
}

testStories.add('Complex Transitions Hook', () => <App />)
