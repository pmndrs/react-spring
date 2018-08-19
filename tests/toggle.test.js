import React from 'react'
import { mount } from 'enzyme'
import sinon from 'sinon'
import createMockRaf from 'mock-raf'
import { Toggler } from '../stories/tests/toggle'

test('toggle', () => {
  const mockRaf = createMockRaf()

  sinon.stub(window, 'requestAnimationFrame').callsFake(mockRaf.raf)

  const wrapper = mount(<Toggler toggle={false} />)

  const box1 = wrapper.childAt(0)

  console.log(box1.html())
  mockRaf.step({ count: 120 })
  console.log(box1.html())

  wrapper.setProps({ toggle: true })

  mockRaf.step({ count: 200 })

  console.log(wrapper.children())

  console.log(box1.html())
})
