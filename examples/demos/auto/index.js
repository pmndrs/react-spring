import React from 'react'
import { Spring, animated, config } from 'react-spring'
import './styles.css'

const LOREM = `Hello world`
let count = 0

export default class App extends React.Component {
  state = { toggle: true, text: [LOREM] }
  onToggle = () => this.setState(state => ({ toggle: !state.toggle }))
  onAddText = () =>
    this.setState(state => ({ toggle: true, text: [...state.text, LOREM] }))
  onRemoveText = () =>
    this.setState(state => ({ toggle: true, text: state.text.slice(1) }))
  render() {
    const { toggle, text } = this.state
    return (
      <div className="auto-main">
        <button onClick={this.onToggle}>Toggle</button>
        <button onClick={this.onAddText}>Add text</button>
        <button onClick={this.onRemoveText}>Remove text</button>
        <div className="content">
          <Spring
            native
            force
            config={{ tension: 2000, friction: 100, precision: 1 }}
            from={{ height: toggle ? 0 : 'auto' }}
            to={{ height: toggle ? 'auto' : 0 }}>
            {props => (
              <animated.div className="item" style={props}>
                {text.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </animated.div>
            )}
          </Spring>
        </div>
      </div>
    )
  }
}
