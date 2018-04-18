import React from 'react'
import ReactDOM from 'react-dom'
import Loadable from 'react-loadable'
import './styles.css'

import Spring from '../src/addons/NumericalSpring'

ReactDOM.render(
  <Spring
    config={{ tension: 0, friction: 100 }}
    from={{ opacity: 0 }}
    to={{ opacity: 1 }}>
    {props => <h1 style={props}>Hello, world!</h1>}
  </Spring>,
  document.getElementById('root')
)
