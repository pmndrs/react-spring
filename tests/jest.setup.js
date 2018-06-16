import Enzyme, { mount } from 'enzyme'
import Adapter from './jest.react.16.adapter'
import delay from 'delay'

Enzyme.configure({ adapter: new Adapter() })

global.snapshot = async function(Root, mutation) {
  const tree = mount(Root)
  expect(tree).toMatchSnapshot()
  if (mutation) {
    await mutation(tree)
    await delay(25)
    tree.update()
    expect(tree).toMatchSnapshot()
  }
  tree.unmount()
}
