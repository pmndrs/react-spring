import React, { Component } from 'react'
import { Spring, animated } from 'react-spring'
import './styles.css'

export default class App extends Component {
  constructor() {
    super()
    this.state = { div1: '', div2: '' }
    this.boundOnRest1 = () => this.onRest1()
    this.boundOnRest2 = () => this.onRest2()
  }
  onRest1() {
    this.setState({ div1: 'onRest triggered!' })
  }

  onRest2() {
    this.setState({ div2: 'onRest triggered!' })
  }

  render() {
    return (
      <div className="app-root">
        <Spring
          from={{
            opacity: 1,
            transform: 'translateY(50%)',
          }}
          to={{ opacity: 1, transform: 'translateY(0)' }}
          onRest={this.boundOnRest1}>
          {styles => (
            <animated.div
              className="div"
              style={{
                ...styles,
                background: 'pink',
              }}>
              <p>Opacity from: 1</p>
              <p>Opacity to: {styles.opacity}</p>
              <p>Transform: {styles.transform}</p>
              <p>onRest: {this.state.div1}</p>
            </animated.div>
          )}
        </Spring>
        <Spring
          from={{
            opacity: 0.99,
            transform: 'translateY(50%)',
          }}
          to={{ opacity: 1, transform: 'translateY(0)' }}
          onRest={this.boundOnRest2}>
          {styles => (
            <animated.div
              className="div"
              style={{
                ...styles,
                background: 'lightblue',
              }}>
              <p>Opacity from: 0.99</p>
              <p>Opacity: {styles.opacity}</p>
              <p>Transform: {styles.transform}</p>
              <p>onRest: {this.state.div2}</p>
            </animated.div>
          )}
        </Spring>
      </div>
    )
  }
}
