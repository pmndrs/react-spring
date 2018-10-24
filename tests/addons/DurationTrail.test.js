import React from 'react'
import { shallow } from 'enzyme'
import DurationTrail from '../../src/addons/DurationTrail'

const fakeChild = () => {
  ;<div>fake</div>
}

// These snapshots won't reveal much, but they'll at least catch hard errors.
describe('DurationTrail', () => {
  it('smoke/regression tests', () => {
    const wrapper = shallow(<DurationTrail children={fakeChild} />)
    expect(wrapper).toMatchSnapshot()
  })
})
