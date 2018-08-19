import React from 'react'
import { mount } from 'enzyme'
import sinon from 'sinon'
import createMockRaf from 'mock-raf'
import { fadeIn } from '../stories/tests/opacity'

test('sanity', () => {
  expect(2 + 2).toBe(4)
})

test('fade in', () => {
  const mockRaf = createMockRaf()

  sinon.stub(window, 'requestAnimationFrame').callsFake(mockRaf.raf)

  const wrapper = mount(fadeIn)

  const box = wrapper.childAt(0)

  console.log(box.html())
  mockRaf.step({ count: 60 })
  console.log(box.html())
})
