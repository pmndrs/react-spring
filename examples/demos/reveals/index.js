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
          from={{ position: 'absolute', overflow: 'hidden', height: 0 }}
          enter={[{ height: 'auto' }]}
          leave={{ height: 0 }}>
          {show =>
            show && (props => <animated.div style={props}>hello</animated.div>)
          }
        </Transition>
      </div>
    )
  }
}
