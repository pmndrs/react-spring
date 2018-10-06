import React from 'react'
import { Keyframes, Spring, animated, config } from 'react-spring'
import {
  Transition as TransitionImpl,
  TransitionGroup,
} from 'react-transition-group'
import './styles.css'

// Wrapper around TransitionGroup to establish a lighter API
class Transition extends React.Component {
  render() {
    const {
      children,
      from,
      enter,
      leave,
      items,
      keys = item => item,
      ...props
    } = this.props
    console.log(children, keys)
    return (
      <TransitionGroup>
        {children.map((child, index) => (
          <TransitionImpl
            key={keys[index]}
            addEndListener={(node, done) => (this.done = done)}
            timeout={{ enter: 0, exit: 5000 }}>
            {state => (
              <Keyframes
                primitive={Spring}
                filter={Keyframes.interpolateTo}
                from={from}
                states={{
                  entered: enter,
                  exiting: leave,
                }}
                state={state}
                {...props}
                children={child}
              />
            )}
          </TransitionImpl>
        ))}
      </TransitionGroup>
    )
  }
}

export default class App extends React.PureComponent {
  state = { items: ['😅', '🚀', '🎉'] }

  componentDidMount() {
    // Remove 🚀
    setTimeout(() => this.setState({ items: ['😅', '🎉'] }), 1500)
    // Add ✨
    setTimeout(() => this.setState({ items: ['😅', '✨', '🎉'] }), 3000)
  }

  render() {
    return (
      <div className="transitiongroup-main">
        <Transition
          native
          keys={this.state.items}
          from={{ opacity: 0, height: 0, transform: 'scale(1)' }}
          enter={[{ opacity: 1, height: 'auto' }, { transform: 'scale(1.5)' }]}
          leave={[
            { transform: 'scale(1)', opacity: 0.5 },
            { opacity: 0 },
            { height: 0 },
          ]}
          config={{
            ...config.stiff,
            restSpeedThreshold: 0.001,
            restDisplacementThreshold: 0.001,
          }}>
          {this.state.items.map(item => props => (
            <animated.div
              style={props}
              className="transitiongroup-item"
              children={item}
            />
          ))}
        </Transition>
      </div>
    )
  }
}
