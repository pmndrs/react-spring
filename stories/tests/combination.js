import React from 'react'
import { testStories } from '../index'

import { Spring } from '../../src/targets/web'

testStories.add('combination', () => (
  <Spring
    from={{ color: 'green', height: '100px' }}
    to={{ color: 'blue', height: '500px' }}>
    {({ color, height }) => (
      <div
        className="block bg-red"
        style={{ backgroundColor: color, height }}
      />
    )}
  </Spring>
))

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
