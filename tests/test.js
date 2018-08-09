import React from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import { Spring, animated, Globals } from './../src/targets/web/index'

let tree

class Test extends React.Component {
  count = 0
  state = { resolve: undefined, props: {}, result: undefined }
  render() {
    let { resolve, props, result } = this.state
    return resolve ? (
      <Spring
        key={this.count++}
        {...props}
        config={{
          tension: 2000,
          friction: 50,
          restSpeedThreshold: 1,
          restDisplacementThreshold: 0.1,
        }}
        onRest={() =>
          setImmediate(() => {
            if (props.native) {
              // Native springs animate outside of react, there is no
              // way that enzyme would be able to synchronize its react
              // wrapper with the dom. forceUpdate updates end-state
              // props and writes them into the react-component
              tree
                .update()
                .find(animated.div)
                .instance()
                .forceUpdate()
            }
            tree.update()
            result = result || props.to
            expect(tree.find('div').get(0).props.style).toMatchObject(result)
            resolve()
          })
        }>
        {props.native
          ? styles => <animated.div style={styles} />
          : styles => <div style={styles} />}
      </Spring>
    ) : null
  }
}

tree = mount(<Test />)

const springImpl = (props, result) =>
  new Promise(resolve => tree.instance().setState({ resolve, props, result }))

const testSpring = async (props, result) => {
  await springImpl(props, result)
  await springImpl({ native: true, ...props }, result)
}

test('numbers', async () =>
  testSpring({ from: { opacity: 0 }, to: { opacity: 1 } }))

test('percentages', async () =>
  testSpring({ from: { width: '0%' }, to: { opacity: '100%' } }))

test('auto', async () =>
  testSpring({ from: { width: 100 }, to: { width: 'auto' } }))

test('colors', async () =>
  testSpring(
    { from: { color: 'green' }, to: { color: '#ff0000' } },
    { color: '#ff0000' }
  ))
