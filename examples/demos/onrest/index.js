import React from 'react'
import { render } from 'react-dom'
import { Spring } from 'react-spring'
import { Motion, spring as motionSpring } from 'react-motion'
import './style.css'

export default class App extends React.Component {
  state = { update: 0 }
  componentDidMount() {
    this._i = setInterval(() => {
      this.setState(({ update = 0 }) => ({
        update: update + 1,
      }))
    }, 2000)
  }
  componentWillUnmount() {
    clearInterval(this._i)
  }
  render() {
    const { update } = this.state
    return (
      <div className="onrest-main">
        <div style={{ padding: 10 }}>this.state.update: {update}</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
          }}>
          <SpringCounter name="react-spring">
            {(onRest, renders) => (
              <Spring
                to={{ progress: update % 2 }}
                config={{ tension: 80, friction: 10 }}
                onRest={onRest}>
                {props => <Anim {...props} />}
              </Spring>
            )}
          </SpringCounter>
          <SpringCounter name="react-motion">
            {onRest => (
              <Motion
                style={{
                  progress: motionSpring(update % 2, {
                    stiffness: 100,
                    damping: 16,
                  }),
                }}
                onRest={onRest}>
                {props => <Anim {...props} />}
              </Motion>
            )}
          </SpringCounter>
        </div>
      </div>
    )
  }
}

class SpringCounter extends React.Component {
  _restCount = 0
  _rendersCount = 0

  state = { update: 0 }
  componentDidMount() {
    this._i = setInterval(() => {
      this.setState(({ update }) => ({
        update: update + 1,
      }))
    }, 500)
  }
  componentWillUnmount() {
    clearInterval(this._i)
  }

  // Using the component state for the onRest counter
  // would cause an infinite loop
  renderRestCounter() {
    if (this._restCountEl) {
      this._restCountEl.innerHTML = this._restCount
    }
  }
  handleRest = () => {
    this._restCount++
    this.renderRestCounter()
  }
  handleRef = el => {
    this._restCountEl = el
    this.renderRestCounter()
  }
  render() {
    const { children } = this.props
    const rendersCount = ++this._rendersCount
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          padding: '10px',
          background: '#798',
        }}>
        this.state.update: {this.state.update}
        <div>with {this.props.name}:</div>
        <div>
          <div>render(): {rendersCount}</div>
          <div>
            onRest(): <span ref={this.handleRef} />
          </div>
        </div>
        {children(this.handleRest)}
      </div>
    )
  }
}

const Anim = ({ progress }) => (
  <div style={{ width: '100%' }}>
    <div
      style={{
        width: '15px',
        height: '15px',
        background: '#FFF',
        borderRadius: '50%',
        transform: `translateX(${80 * progress}px)`,
      }}
    />
  </div>
)
