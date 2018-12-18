import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTransition, useSpring, animated, config, useChain2 } from 'react-spring/hooks'
import styled from 'styled-components'
import range from 'lodash/range'
import data from '../list-reordering/data'

export default function App () {
  const [open, set] = useState(true)

  // 1. create spring-refs, which will refer to the springs Controller
  const springRef = useRef()
  const props = useSpring({
    from: { size: '20%' },
    size: open ? '80%' : '20%',
    config: config.stiff,
    ref: springRef
  })

  // 2. create transition-refs
  const transRef = useRef()
  const transitions = useTransition({
    items: open ? data : [],
    keys: item => item.name,
    from: { opacity: 0, transform: 'scale(0)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' },
    trail: 500 / data.length,
    config: config.stiff,
    unique: true,
    ref: transRef
  })

  useChain2(open ? [springRef, transRef] : [transRef, springRef], [open])

  return (
    <Main>
      <Sidebar style={{ width: props.size, height: props.size }} onClick={() => set(open => !open)}>
        {transitions.map(({ item, key, props }) => (
          <Item key={key} style={{ ...props, background: item.css }} />
        ))}
      </Sidebar>
    </Main>
  )
}

const Main = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Sidebar = styled(animated.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  grid-gap: 20px;
  padding: 20px;
  background: white;
  overflow-y: scroll;
  border-radius: 5px;
  cursor: pointer;
  will-change: width, height;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.05);
`

const Item = styled(animated.div)`
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 5px;
  background-image: url(https://images.unsplash.com/photo-1544511916-0148ccdeb877?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1901&q=80i);
  background-size: cover;
  background-position: center center;
  will-change: transform, opacity;
`
