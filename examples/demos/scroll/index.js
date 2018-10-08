import React from 'react'
import { Spring, animated, config } from 'react-spring'
import './styles.css'

const COLORS = [
  'crimson',
  'teal',
  'coral',
  'hotpink',
  'skyblue',
  'salmon',
  'seagreen',
  'peachpuff',
]

export default class App extends React.Component {
  state = { y: 0 }
  el = React.createRef()
  spring = React.createRef()
  setY = () => this.setState({ y: Math.round(Math.random() * 750) + 50 })
  // User interaction should stop animation in order to prevent scroll-hijacking
  // Doing this on onWheel isn't enough, but just to illustrate ...
  stop = () => this.spring.current.stop()
  render() {
    const y = this.el.current ? this.el.current.scrollTop : 0
    return (
      <div className="dashoffset-main">
        <Spring
          native
          reset
          from={{ y }}
          to={{ y: this.state.y }}
          ref={this.spring}
          config={config.slow}>
          {props => (
            <animated.div
              className="c"
              ref={this.el}
              onWheel={this.stop}
              scrollTop={props.y}>
              {COLORS.map(c => (
                <div key={c} style={{ height: 200, background: c }} />
              ))}
            </animated.div>
          )}
        </Spring>
        <div className="b" onClick={this.setY} />
      </div>
    )
  }
}
