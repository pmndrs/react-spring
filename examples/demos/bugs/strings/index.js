import React from 'react'
import { Transition, animated } from 'react-spring'
import { hidden } from 'ansi-colors'

export default class ReactSpringTest extends React.Component {
  state = {
    collapsed2: true,
  }
  render() {
    const { collapsed2 } = this.state
    return (
      <div>
        <button
          className="btn btn-info"
          onClick={() => this.setState({ collapsed2: !this.state.collapsed2 })}>
          Toggle 2 - Opacity And Height (onUpdate continues to run forever after
          animation stops)
        </button>
        <Transition
          native
          from={{ height: 0 }}
          enter={{ height: 'auto' }}
          leave={{ height: 0 }}>
          {!collapsed2 &&
            (styles => (
              <animated.div style={{ overflow: 'hidden', ...styles }}>
                <div style={{ backgroundColor: '#00FF00' }}>My Component</div>
              </animated.div>
            ))}
        </Transition>

        <div style={{ marginTop: '20px' }}>
          Instructions for testing.
          <p>Click Toggle 2 a few times and let the animation complete.</p>
          <p>
            Open chrome performance timeline and record a few seconds while
            doing nothing.
          </p>
          <p>
            Note the timeline shows that react-spring is constantly using CPU
            even though nothing is happening. It is running the onUpdate
            function in SpringAnimate.js over and over.
          </p>
        </div>
      </div>
    )
  }
}
