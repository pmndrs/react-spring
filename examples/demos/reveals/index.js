import React from 'react'
import ReactDOM from 'react-dom'
import { Spring, Transition, animated, config, interpolate } from 'react-spring'
import './styles.css'

export default class App extends React.PureComponent {
  state = { show: true, motion: false }
  toggle = e => this.setState(state => ({ show: !state.show }))
  render() {
    return (
      <div className="reveals-main" onClick={this.toggle}>
        <Transition
          native
          items={this.state.show}
          from={{ position: 'absolute', opacity: 0, coords: [40, 40] }}
          enter={{ opacity: 1, coords: [0, 0] }}
          leave={{ opacity: 0, coords: [-40, -40] }}>
          {show =>
            show &&
            (({ coords, ...props }) => (
              <animated.div
                style={{
                  ...props,
                  transform: coords.interpolate(
                    (x, y) => `translate3d(${x}px,${y}px,0)`
                  ),
                }}>
                hello
              </animated.div>
            ))
          }
        </Transition>
      </div>
    )
  }
}
