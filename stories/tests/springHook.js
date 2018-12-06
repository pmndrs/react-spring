import React, { useEffect, useState, useRef } from 'react'
import {
  useSpring,
  animated,
  config,
  useSpringKeyframes
} from '../../src/targets/web/hooks'
import { testStories } from '../index'
import './styles.css'

function TestSpring () {
  const ref = useRef(null)
  const [length, set] = useState(0)
  const [props] = useSpring({ dash: length, config: config.molasses })

  useEffect(() => void set(ref.current.getTotalLength()), [])

  return (
    <svg
      width='180'
      viewBox='0 0 23 23'
      display={ref.current ? 'display' : 'none'}
    >
      <g fill='transparent' stroke='hotpink' strokeWidth='0.5'>
        <animated.path
          ref={ref}
          strokeDasharray={length}
          strokeDashoffset={props.dash.interpolate(d => length - d)}
          d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
        />
      </g>
    </svg>
  )
}

testStories.add('Spring Hook', () => <TestSpring />)

function TestColor () {
  const [state, setState] = React.useState('entry')
  const props = useSpringKeyframes(
    {
      state,
      states: {
        entry: { backgroundColor: '#FFAF44', config: config.slow },
        exit: { backgroundColor: '#000000' }
      }
    },
    { backgroundColor: '#000000' }
  )

  return <>
  <button onClick={_ => setState( state === 'entry' ? 'exit' : 'entry')}>toggle</button>
  <animated.div style={{ ...props, width: '200px', height: '200px' }} /> </>
}

testStories.add('Color Spring Hook', () => <TestColor />)
