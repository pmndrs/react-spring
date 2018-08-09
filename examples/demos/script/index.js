import React from 'react'
import { Keyframes, animated } from 'react-spring'
import delay from 'delay'

const Content = Keyframes.Spring(async next => {
  // None of this will cause React to render, the component renders only once :-)
  while (true) {
    await next({
      from: { opacity: 0, width: 50, height: 50, background: 'black' },
      to: { opacity: 1, width: 80, height: 80, background: 'tomato' },
    })
    await next({
      from: { left: '0%' },
      to: { left: '70%', background: 'seagreen' },
    })
    next({
      from: { top: '0%' },
      to: { top: '40%', background: 'plum' },
      config: { tension: 10, friction: 0 },
    })
    await delay(2000) // don't wait for the animation above to finish, go to the next one in 2s
    await next({ to: { left: '0%', background: 'hotpink' } })
    await next({
      to: { top: '0%', background: 'teal' },
      config: { tension: 500, friction: 5 },
    })
    await next({
      to: { opacity: 0, width: 40, height: 40, background: 'black' },
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
