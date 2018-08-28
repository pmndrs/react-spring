import React from 'react'
import { boolean } from '@storybook/addon-knobs'
import { testStories } from '../index'

import { Transition } from '../../src/targets/web'

export const Toggler = ({ toggle }) => (
  <Transition
    from={{ opacity: 0 }}
    enter={{ opacity: 1 }}
    leave={{ opacity: 0 }}>
    {!toggle
      ? styles => (
          <div className="fixed bg-red" style={styles}>
            Component A
          </div>
        )
      : styles => (
          <div className="fixed bg-blue" style={styles}>
            Component B
          </div>
        )}
  </Transition>
)

testStories.add('toggle', () => <Toggler toggle={boolean('Toggle', false)} />)
