import React from 'react'

import { mount } from 'enzyme'

import { fadeIn } from '../stories'

import { replaceRaf } from 'raf-stub'

// override requestAnimationFrame and cancelAnimationFrame with a stub
replaceRaf()

test('hey', () => {
  expect(2 + 2).toBe(4)
})

test('fader', () => {
  const wrapper = mount(fadeIn)

  console.log(wrapper.childAt(0).html())
  requestAnimationFrame.step()

  console.log(wrapper.childAt(0).html())
  requestAnimationFrame.step()

  console.log(wrapper.childAt(0).html())
})
