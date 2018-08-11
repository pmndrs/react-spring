import React from 'react'
import { storiesOf } from '@storybook/react'

import { Spring } from '../src/targets/web'

export const fadeIn = (
  <Spring from={{ opacity: 0 }} to={{ opacity: 1 }}>
    {styles => (
      <div
        style={{
          width: 500,
          height: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'red',
          ...styles,
        }}>
        i will fade in
      </div>
    )}
  </Spring>
)

const moveRight = (
  <Spring from={{ left: 0 }} to={{ left: 50 }}>
    {styles => <div style={{ position: 'absolute', ...styles }}>Hey</div>}
  </Spring>
)

storiesOf('Temp', module)
  .add('div', () => fadeIn)
  .add('right', () => moveRight)
