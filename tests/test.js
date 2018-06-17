import React from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import { Spring, animated, Globals } from './../src/targets/web/index'

const springImpl = (props, result) =>
  new Promise(resolve => {
    let tree = mount(
      <Spring
        {...props}
        onRest={() =>
          setImmediate(() => {
            props.native &&
              tree
                .find(animated.div)
                .instance()
                .forceUpdate()
            tree.update()
            result = result || props.to
            expect(tree.find('div').get(0).props.style).toMatchObject(result)
            tree.unmount()
            resolve()
          })
        }>
        {props.native
          ? styles => <animated.div style={styles} />
          : styles => <div style={styles} />}
      </Spring>
    )
  })

const testSpring = (props, result) =>
  Promise.all([
    springImpl(props, result),
    springImpl({ native: true, ...props }, result),
  ])

test('numbers', async () =>
  testSpring({
    from: { width: '0%', opacity: 0 },
    to: { width: '100%', opacity: 1 },
  }))

test('auto', async () =>
  testSpring({ from: { width: 100 }, to: { width: 'auto' } }))

test('colors', async () =>
  testSpring(
    { from: { color: 'green' }, to: { color: '#ff0000' } },
    { color: 'rgba(255, 0, 0, 1)' }
  ))
