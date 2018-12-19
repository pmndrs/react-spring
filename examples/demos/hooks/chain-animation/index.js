import React, { useState, useRef, useEffect } from 'react'
import {
  useTransition,
  useSpring,
  animated,
  config,
  useChain,
} from 'react-spring/hooks'
import styled from 'styled-components'
import data from '../list-reordering/data'

export default function App() {
  const [open, set] = useState(true)

  // 1. create spring-refs, which will refer to the springs Controller
  const springRef = useRef()
  const { size, opacity, ...rest } = useSpring({
    from: { size: '20%', background: 'hotpink' },
    size: open ? '100%' : '20%',
    background: open ? 'white' : 'hotpink',
    opacity: open ? 0 : 1,
    config: config.stiff,
    ref: springRef,
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
    ref: transRef,
  })

  const chain = [springRef, transRef]
  useChain(open ? chain : chain.reverse())

  return (
    <Main>
      <Sidebar
        style={{ ...rest, width: size, height: size }}
        onClick={() => set(open => !open)}>
        <Content style={{ opacity }}>Click</Content>
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
  padding: 20px;
`

const Sidebar = styled(animated.div)`
  position: relative;
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

const Content = styled(animated.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
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
