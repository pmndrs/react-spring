import React from 'react'
import ReactDOM from 'react-dom'
import { Transition, animated, config } from 'react-spring'
import './styles.css'

export default class App extends React.PureComponent {
  state = { show: true }
  toggle = e => this.setState(state => ({ show: !state.show }))
  render() {
    return (
      <div className="reveals-main" onClick={this.toggle}>
        <Transition
          native
          unique
          items={this.state.show}
          from={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0 }}>
          {show =>
            show && (props => <animated.div style={props}>hello</animated.div>)
          }
        </Transition>
      </div>
    )
  }
}
