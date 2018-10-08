import React from 'react'
import { shallow } from 'enzyme'
import Trail from '../src/Trail'

const fakeChild = () => {
  ;<div>fake</div>
}

// These snapshots won't reveal much, but they at least will catch hard errors.
describe('Trail', () => {
  it('smoke/regression tests', () => {
    const wrapper = shallow(
      <Trail keys={[0, 1]}>
        <fakeChild />
        <fakeChild />
      </Trail>
    )
    expect(wrapper).toMatchSnapshot()
  })
})
