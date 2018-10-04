import React from 'react'
import ReactDOM from 'react-dom'
import { Keyframes, animated, config } from 'react-spring'
import { Transition, TransitionGroup } from 'react-transition-group'
import './styles.css'

const Animation = Keyframes.Spring.to({
  // Open & fade in first, then grow a bit in size
  entered: [{ opacity: 1, height: 'auto' }, { transform: 'scale(1.5)' }],
  // Shrink a little, then fade out, then close
  exiting: [
    { transform: 'scale(1)', opacity: 0.5 },
    { opacity: 0 },
    { height: 0 },
  ],
})

export default class App extends React.PureComponent {
  state = { items: ['😅', '🚀', '🎉'] }

  componentDidMount() {
    setTimeout(() => this.setState({ items: ['😅', '🎉'] }), 1500)
    setTimeout(() => this.setState({ items: ['😅', '✨', '🎉'] }), 3000)
  }

  render() {
    return (
      <div className="transitiongroup-main">
        <TransitionGroup>
          {this.state.items.map(item => (
            <Transition
              key={item}
              unmountOnExit
              timeout={{ enter: 0, exit: 4000 }}>
              {state => (
                <Animation
                  native
                  config={{
                    ...config.stiff,
                    restSpeedThreshold: 0.001,
                    restDisplacementThreshold: 0.001,
                  }}
                  from={{ opacity: 0, height: 0, transform: 'scale(1)' }}
                  state={state}>
                  {props => (
                    <animated.div
                      className="transitiongroup-item"
                      style={props}>
                      {item}
                    </animated.div>
                  )}
                </Animation>
              )}
            </Transition>
          ))}
        </TransitionGroup>
      </div>
    )
  }
}
