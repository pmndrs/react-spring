import * as React from 'react'
import { useSpring, animated } from '@react-spring/web'

const App = () => {
  const [open, toggle] = React.useState(false)
  const props = useSpring({ width: open ? 100 : 0 })

  return (
    <div className="main" onClick={() => toggle(!open)}>
      <animated.div className="fill" style={props} />
      <animated.div className="content">
        {props.width.interpolate(x => x.toFixed(0))}
      </animated.div>
    </div>
  )
}

export default App
