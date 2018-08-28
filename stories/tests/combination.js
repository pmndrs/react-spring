import React from 'react'
import { testStories } from '../index'

import { Spring, animated } from '../../src/targets/web'

export const ColorAndHeight = () => (
  <Spring
    native={true}
    from={{ color: 'green', height: '100px' }}
    to={{ color: '#ff00ff', height: '500px' }}>
    {({ color, height }) => (
      <animated.div
        className="block"
        style={{ backgroundColor: color, height }}>
        test
      </animated.div>
    )}
  </Spring>
)

testStories.add('combination', () => <ColorAndHeight />)

testStories.add('combination #2', () => (
  <Spring
    from={{ left: 0, rotation: '0deg' }}
    to={{ left: 100, rotation: '-90deg' }}>
    {({ left, rotation }) => (
      <div
        className="block bg-blue"
        style={{ transform: `translate(${left}px,0px) rotate(${rotation})` }}
      />
    )}
  </Spring>
))
