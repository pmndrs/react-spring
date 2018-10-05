import React from 'react'
import { shallow } from 'enzyme'
import Keyframes from '../src/Keyframes'

const fakeChild = () => {
  ;<div>fake</div>
}

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
})
