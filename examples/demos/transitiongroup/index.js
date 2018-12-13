import React from 'react'
import { Transition, animated } from 'react-spring'
import './styles.css'

export default class App extends React.PureComponent {
  state = { items: [] }

  componentDidMount() {
    // Add 😅 🚀 🎉
    setTimeout(() => this.setState({ items: ['😅', '🚀', '🎉'] }), 0)
    // Remove 🚀
    setTimeout(() => this.setState({ items: ['😅', '🎉'] }), 2500)
    // Add ✨
    setTimeout(() => this.setState({ items: ['😅', '✨', '🎉'] }), 5000)
  }

  render() {
    return (
      <div
        className="transitiongroup-main"
        onClick={() => this.componentDidMount()}>
        <Transition
          native
          items={this.state.items}
          from={{ opacity: 0, height: 0, transform: 'scale(1)' }}
          enter={[{ opacity: 1, height: 50 }, { transform: 'scale(1.25)' }]}
          leave={[
            { transform: 'scale(1)', opacity: 0.5 },
            { opacity: 0 },
            { height: 0 },
          ]}>
          {item => props => (
            <animated.div
              style={props}
              className="transitiongroup-item"
              children={item}
            />
          )}
        </Transition>
      </div>
    )
  }
}
