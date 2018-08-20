import React from 'react'
import { mount } from 'enzyme'
import createMockRaf from 'mock-raf'
import { fadeIn } from '../stories/tests/opacity'
import { Globals } from '../src/targets/web'

test('sanity', () => {
  expect(2 + 2).toBe(4)
})

test('fade in', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const wrapper = mount(fadeIn)

  const box = wrapper.childAt(0)

  console.log(box.html())

  mockRaf.step({ count: 10 })

  console.log(box.html())
})
