import React, { useState, useContext, createElement } from 'react'
import styled from 'styled-components'
import { UnControlled } from 'react-codemirror2'
import { useSpring, animated, config } from '../src/targets/web'

const Context = React.createContext()

function RewindSpringProvider({ children }) {
  const [flip, set] = useState(false)
  const animatedProps = useSpring({
    reset: true,
    reverse: flip,
    from: { x: 0 },
    x: 1,
    delay: 200,
    config: config.molasses,
    onRest: () => set(!flip),
  })

  return <Context.Provider value={animatedProps} children={children} />
}

function RewindSpring({ children, style }) {
  const { x } = useContext(Context)
  return (
    <div
      style={{
        overflow: 'hidden',
        background: '#f0f0f0',
        color: 'rgb(45, 55, 71)',
        ...style,
      }}>
      {children(x)}
    </div>
  )
}

const CodeMirror = ({ value }) => (
  <UnControlled
    value={value}
    options={{
      mode: 'jsx',
      theme: 'dracula',
      lineNumbers: true,
      readOnly: true,
      showCursorWhenSelecting: false,
      cursorHeight: 0,
    }}
  />
)

const Grid = styled('div')`
  display: grid;
  grid-gap: ${props => props.gap || '20px'};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-auto-rows: minmax(200px, auto);
`

const Image = styled('a')`
  background-image: url(${props => props.url});
  background-size: ${props => props.size || 'contain'};
  background-repeat: no-repeat;
  background-position: center center;
`

export {
  Grid,
  Image,
  CodeMirror,
  RewindSpringProvider,
  RewindSpring,
  animated,
  Splash,
}
