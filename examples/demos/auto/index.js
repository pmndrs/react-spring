import React from 'react'
import { Spring, animated } from 'react-spring'
import './styles.css'

const LOREM = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
              text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of Lorem Ipsum.`

export default class App extends React.Component {
  state = { toggle: true, text: [LOREM] }
  onToggle = () => this.setState(state => ({ toggle: !state.toggle }))
  onAddText = () => this.setState(state => ({ text: [...state.text, LOREM] }))
  onRemoveText = () => this.setState(state => ({ text: state.text.slice(1) }))
  render() {
    const { toggle, text } = this.state
    return (
      <div>
        <button onClick={this.onToggle}>Toggle</button>
        <button onClick={this.onAddText}>Add text</button>
        <button onClick={this.onRemoveText}>Remove text</button>
        <div className="content">
          <Spring
            native
            from={{ height: 0 }}
            to={{ height: toggle ? 'auto' : 0 }}>
            {props => (
              <animated.div className="item" style={props}>
                {text.map(t => <p>{t}</p>)}
              </animated.div>
            )}
          </Spring>
        </div>
      </div>
    )
  }
}
