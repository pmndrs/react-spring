import React from 'react'
import { Spring, animated, config } from 'react-spring'
import './styles.css'

const speed = {
  tension: 1,
  friction: 1,
  restDisplacementThreshold: 5,
  restSpeedThreshold: 5,
}

export default class App extends React.Component {
  state = { y: 0 }
  ref = r => (this.el = r)
  click = () => this.setState({ y: 200 })
  render() {
    const y = this.el ? this.el.scrollTop : 0
    return (
      <Spring native reset from={{ y }} to={{ y: this.state.y }} config={speed}>
        {props => (
          <animated.div
            className="c"
            ref={this.ref}
            onClick={this.click}
            scrollTop={props.y}>
            <div style={{ height: 200, background: 'crimson' }} />
            <div style={{ height: 200, background: 'teal' }} />
            <div style={{ height: 200, background: 'coral' }} />
            <div style={{ height: 200, background: 'hotpink' }} />
            <div style={{ height: 200, background: 'skyblue' }} />
            <div style={{ height: 200, background: 'salmon' }} />
            <div style={{ height: 200, background: 'seagreen' }} />
            <div style={{ height: 200, background: 'peachpuff' }} />
          </animated.div>
        )}
      </Spring>
    )
  }
}
