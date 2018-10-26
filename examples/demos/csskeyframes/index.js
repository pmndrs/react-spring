import React from 'react'
import { Spring, animated } from 'react-spring'

/*
0 % { transform: scale(1); }
25 % { transform: scale(.97); }
35 % { transform: scale(.9); }
45 % { transform: scale(1.1); }
55 % { transform: scale(.9); }
65 % { transform: scale(1.1); }
75 % { transform: scale(1.03); }
100 % { transform: scale(1); }
`*/

export default class Demo extends React.Component {
  state = { toggle: true }
  toggle = () => this.setState(state => ({ toggle: !state.toggle }))
  render() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4em' }} onClick={this.toggle}>
        <Spring native from={{ x: 0 }} to={{ x: this.state.toggle ? 1 : 0 }} config={{ duration: 1000 }}>
          {({ x }) => (
            <animated.div
              style={{
                opacity: x.interpolate({ output: [0.3, 1] }),
                transform: x
                  .interpolate([0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1], [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1])
                  .interpolate(x => `scale(${x})`)
              }}>
              click
            </animated.div>
          )}
        </Spring>
      </div>
    )
  }
}
