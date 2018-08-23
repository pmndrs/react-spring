import React from 'react'
import { testStories } from '../index'

import { Spring, animated } from '../../src/targets/web'

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

export const Width = () => (
  <div style={{ width: 500, height: 500, padding: 10 }} className="bg-red">
    <Spring from={{ width: '0%' }} to={{ width: '100%' }}>
      {animatedStyle => (
        <div className="bg-blue" style={{ height: '100%', ...animatedStyle }}>
          test
        </div>
      )}
    </Spring>
  </div>
)

testStories.add('move right', () => moveRight).add('width', () => <Width />)
