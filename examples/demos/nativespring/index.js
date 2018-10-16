import React from 'react'
import { Spring, animated, interpolate, config } from 'react-spring'

const TRIANGLE = 'M20,380 L380,380 L380,380 L200,20 L20,380 Z'
const RECTANGLE = 'M20,20 L20,380 L380,380 L380,20 L20,20 Z'
const styles = {
  container: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    willChange: 'background',
  },
  shape: { width: 300, height: 300, willChange: 'transform' },
}

const Content = ({ toggle, backgroundColor, fill, rotate, scale, shape }) => (
  <animated.div style={{ ...styles.container, backgroundColor }}>
    <animated.svg
      style={{
        ...styles.shape,
        fill,
        transform: interpolate(
          [rotate, scale],
          (r, s) => `rotate3d(0,1,0,${r}) scale(${s})`
        ),
      }}
      version="1.1"
      viewBox="0 0 400 400">
      <g style={{ cursor: 'pointer' }} fillRule="evenodd" onClick={toggle}>
        <animated.path id="path-1" d={shape} />
      </g>
    </animated.svg>
  </animated.div>
)

export default class NativeSpringExample extends React.Component {
  state = { toggle: true }
  toggle = () => this.setState(state => ({ toggle: !state.toggle }))
  componentDidMount() {
    //setInterval(() => this.forceUpdate(), 1000)
  }
  render() {
    const toggle = this.state.toggle
    return (
      <Spring
        native
        from={{ fill: 'black' }}
        to={{
          fill: toggle ? '#247BA0' : '#70C1B3',
          backgroundColor: toggle ? '#A29B7F' : '#F3FFBD',
          rotate: toggle ? '0deg' : '180deg',
          scale: toggle ? 0.3 : 0.7,
          shape: toggle ? TRIANGLE : RECTANGLE,
        }}
        toggle={this.toggle}
        children={Content}
        onRest={() => console.log('done')}
      />
    )
  }
}
