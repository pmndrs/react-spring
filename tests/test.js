import React from 'react'
import { mount } from 'enzyme'
import { Spring } from './../src/targets/web/index'

it('basic spring', async () => {
  return new Promise(resolve => {
    const from = {
      opacity: 0,
      width: '0%',
      transform: 'scale(0) translate3d(0px,0,0)',
      color: 'red',
    }

    const to = {
      opacity: 1,
      pointerEvents: 'all',
      width: '100%',
      transform: 'scale(1) translate3d(10px,0,0)',
      color: '#aabbcc',
    }

    const tree = mount(
      <Spring from={from} to={to} onRest={() => requestAnimationFrame(onRest)}>
        {styles => <div style={styles} />}
      </Spring>
    )

    function onRest() {
      tree.update()
      //console.log(tree.find('div').get(0).props.style)
      expect(tree.find('div').get(0).props.style).toMatchObject({
        ...to,
        color: 'rgba(170, 187, 204, 1)',
      })
      tree.unmount()
      resolve()
    }
  })
})
