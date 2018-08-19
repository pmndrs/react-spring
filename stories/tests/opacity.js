import React from 'react'
import { testStories } from '../index'

import { Spring } from '../../src/targets/web'

export const fadeIn = (
  <Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
    {({ opacity }) => <div className="block bg-red" style={{ opacity }} />}
  </Spring>
)

testStories.add('fade in', () => fadeIn)
