import React from 'react'
import { Spring, animated } from 'react-spring'
import { TimingAnimation } from '../../../src/addons'
import { GradientPinkRed as Gradient } from '@vx/gradient'

export default class App extends React.Component {
  state = { offset: 0 }
  path = React.createRef()
  componentDidMount() {
    this.setState({ offset: this.path.current.getTotalLength() })
  }
  render() {
    const { offset } = this.state
    return (
      <svg width="500" viewBox="0 0 23 23">
        <Gradient id="gradient" />
        <g fill="transparent" stroke="url(#gradient)" strokeWidth="0.2">
          <Spring
            native
            reset
            from={{ dash: offset }}
            to={{ dash: 0 }}
            impl={TimingAnimation}
            config={{ duration: 5000 }}>
            {props => (
              <animated.path
                ref={this.path}
                strokeDasharray={offset}
                strokeDashoffset={props.dash}
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            )}
          </Spring>
        </g>
      </svg>
    )
  }
}
