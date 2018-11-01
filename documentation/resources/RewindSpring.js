import React from 'react'
import { Spring, animated, config } from '../../src/targets/web'
import Meter from 'grommet/components/Meter'

const AnimatedMeter = animated(Meter)
const { Provider, Consumer } = React.createContext()

class RewindSpringProvider extends React.Component {
  constructor() {
    super()
    this.state = { flip: false }
  }
  render() {
    const { flip } = this.state
    const { children, ...props } = this.props
    return (
      <Spring
        native
        reset
        reverse={flip}
        from={{ progress: '0%', x: 0 }}
        to={{ progress: '100%', x: 1 }}
        delay={200}
        config={config.molasses}
        {...props}
        onRest={() => this.setState(state => ({ flip: !state.flip }))}>
        {props => <Provider value={props} children={children} />}
      </Spring>
    )
  }
}

const RewindSpring = ({ children, style, hideProgress }) => (
  <div style={{ overflow: 'hidden', background: '#f5f5f5', color: '#575757', ...style }}>
    <Consumer>
      {({ progress, x }) => (
        <React.Fragment>
          {children(x)}
          {!hideProgress && (
            <animated.div
              style={{
                position: 'absolute',
                zIndex: 1000,
                left: 0,
                bottom: 0,
                height: 10,
                width: progress,
                background: '#ffdd00',
              }}
            />
          )}
        </React.Fragment>
      )}
    </Consumer>
  </div>
)

export { AnimatedMeter, Provider, Consumer, RewindSpringProvider, RewindSpring }
