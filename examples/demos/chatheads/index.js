import React from 'react'
import { Trail, animated, interpolate } from 'react-spring'
import './styles.css'

export default class Demo extends React.Component {
  items = [0, 1, 2, 3, 4, 5]
  state = { x: 0, y: 0 }
  handleMouseMove = ({ pageX: x, pageY: y }) => this.setState({ x, y })
  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove)
  }

  render() {
    return (
      <div className="demo1">
        <Trail items={this.items} to={this.state}>
          {items => ({ x, y }) => (
            <div
              className="demo1-ball"
              style={{ transform: `translate3d(${x - 25}px, ${y - 25}px, 0)` }}
              //style={{ transform: interpolate([x,y], (x,y) => `translate3d(${x - 25}px, ${y - 25}px, 0)`) }}
            />
          )}
        </Trail>
      </div>
    )
  }
}
