import React from 'react'
import { shallow } from 'enzyme'
import Spring from '../Spring'

const fakeChild = () => <div>fake</div>

// These snapshots won't reveal much, but they at least will catch hard errors.
describe('Spring', () => {
  it('smoke/regression tests', () => {
    const spring = shallow(<Spring />)
    expect(spring).toMatchSnapshot()
  })

  it('fires componentDidUpdate on componentDidMount', () => {
    const spy = jest.spyOn(Spring.prototype, 'componentDidUpdate')
    const spring = shallow(<Spring />)
    spring.instance().componentDidMount()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
