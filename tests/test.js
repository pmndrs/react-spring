import React from 'react'
import ReactDOM from 'react-dom'
import { mount } from 'enzyme'
import { Spring, animated } from './../src/targets/web/index'

const testSpring = (props, result) =>
  new Promise(resolve => {
    let tree = mount(
      <Spring
        {...props}
        onRest={() =>
          process.nextTick(() => {
            tree = tree.update()
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

test('numbers', async () => {
  await testSpring({ from: { opacity: 0 }, to: { opacity: 1 } })
  //await testSpring({ native: true, from: { opacity: 0 }, to: { opacity: 1 } })
})
