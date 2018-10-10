import React from 'react'
import { shallow } from 'enzyme'
import Transition from '../Transition'

const fakeChild = item => props => {
  ;<div>fake</div>
}

// These snapshots won't reveal much, but they at least will catch hard errors.
describe('Transition', () => {
  it('smoke/regression tests', () => {
    const wrapper = shallow(
      <Transition>
        <fakeChild />
      </Transition>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
