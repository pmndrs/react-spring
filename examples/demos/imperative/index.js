import React from 'react'
import { Controller, animated } from 'react-spring'
import './styles.css'

export default class Demo extends React.Component {
  constructor() {
    super()
    this.animations = new Controller({ blob1: [0, 0] })
    this.animations.update({ blob2: this.animations.getValues().blob1 })
    this.animations.update({ blob3: this.animations.getValues().blob2 })
  }
  componentDidMount = () => window.addEventListener('mousemove', this.handleMouseMove)
  handleMouseMove = ({ pageX, pageY }) =>
    // Update the first blob, the "true" starts the animation
    this.animations.update({ blob1: [pageX, pageY] })
  transform = (x, y) => `translate3d(${x - 35}px, ${y - 35}px, 0)`
  render() {
    const { blob1, blob2, blob3 } = this.animations.getValues()
    // This component will only render once ...
    console.log(blob1)
    return (
      <div className="imp">
        <animated.div style={{ transform: blob3.interpolate(this.transform) }}>3</animated.div>
        <animated.div style={{ transform: blob2.interpolate(this.transform) }}>2</animated.div>
        <animated.div style={{ transform: blob1.interpolate(this.transform) }}>1</animated.div>
      </div>
    )
  }
}