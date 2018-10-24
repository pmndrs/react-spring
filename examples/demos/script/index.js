import React from 'react'
import { Keyframes, animated, config } from 'react-spring'
import delay from 'delay'

const Content = Keyframes.Spring(async next => {
  // None of this will cause React to render, the component renders only once :-)
  while (true) {
    await next({
      from: { opacity: 0, width: 50, height: 50, background: 'black' },
      opacity: 1,
      width: 80,
      height: 80,
      background: 'tomato',
    })
    await next({
      from: { left: '0%' },
      left: '70%',
      background: 'seagreen',
    })
    next({
      from: { top: '0%' },
      top: '40%',
      background: 'plum',
      config: config.wobbly,
    })
    await delay(2000) // don't wait for the animation above to finish, go to the next one in 2s
    await next({ left: '0%', background: 'hotpink' })
    await next({
      top: '0%',
      background: 'teal',
    })
    await next({
      opacity: 0,
      width: 40,
      height: 40,
      background: 'black',
    })
  }
})

export default class App extends React.Component {
  render() {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          background: 'aquamarine',
          padding: 10,
        }}>
        <Content native>
          {props => (
            <animated.div
              style={{ position: 'relative', borderRadius: '50%', ...props }}
            />
          )}
        </Content>
      </div>
    )
  }
}
