import React from 'react'
import { testStories } from '../index'

import { Spring } from '../../src/targets/web'

export const moveRight = (
  <Spring from={{ left: 0 }} to={{ left: 200 }}>
    {animatedStyle => (
      <div
        className="block bg-blue"
        style={{ position: 'absolute', ...animatedStyle }}
      />
    )}
  </Spring>
)

testStories.add('move right', () => moveRight)
