import React from 'react'
import { shallow } from 'enzyme'
import Keyframes, { create } from '../src/Keyframes'
import Spring from '../src/Spring'

const fakeChild = () => <div>fake</div>

// These snapshots won't reveal much, but they at least will catch hard errors.
describe('Keyframes', () => {
  it('smoke/regression tests', () => {
    const spring = shallow(<Keyframes.Spring />)
    expect(spring).toMatchSnapshot()

    const trail = shallow(<Keyframes.Trail />)
    expect(trail).toMatchSnapshot()

    const transition = shallow(<Keyframes.Transition />)
    expect(transition).toMatchSnapshot()
  })

  it('Keyframes create', () => {
    const Created = create(fakeChild)
    const spy = jest.fn()
    const Comp = Created(spy)
    const wrapper = shallow(<Comp />)
    // console.log(wrapper.render());
    expect(wrapper).toMatchSnapshot()
    expect(wrapper.props().states.__default).toEqual(spy)
  })
})
