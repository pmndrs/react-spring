import React from 'react'
import createContext from 'immer-wieder'
import { Spring, animated, config } from '../src/targets/web'
import Meter from 'grommet/components/Meter'

const AnimatedMeter = animated(Meter)
const { Provider, Consumer } = createContext()

class RewindSpringProvider extends React.Component {
  constructor() {
    super()
    this.state = { flip: false }
  }
  render() {
    const { flip } = this.state
    return (
      <Spring
        native
        reset
        reverse={flip}
        from={{ progress: '0%', x: 0 }}
        to={{ progress: '100%', x: 1 }}
        config={{ delay: 750, ...config.slow }}
        onRest={() => this.setState(state => ({ flip: !state.flip }))}>
        {props => <Provider key={new Date()} value={props} {...this.props} />}
      </Spring>
    )
  }
}

const RewindSpring = ({ children }) => (
  <Consumer>
    {({ progress, x }) => (
      <>
        {children(x)}
        <animated.div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: 10,
            width: progress,
            background: '#ffcf00',
          }}
        />
      </>
    )}
  </Consumer>
)

export { AnimatedMeter, Provider, Consumer, RewindSpringProvider, RewindSpring }
