import React, { useState, useRef, useEffect } from 'react'
import {
  useTransition,
  useSpring,
  animated,
  config,
  useChain,
} from 'react-spring'
import styled from 'styled-components'
import data from '../list-reordering/data'

export default function App() {
  const [open, set] = useState(false)

  // 1. create spring-refs, which will refer to the springs Controller
  const springRef = useRef()
  const { size, opacity, ...rest } = useSpring({
    from: { size: '20%', background: 'hotpink' },
    size: open ? '80%' : '20%',
    background: open ? 'white' : 'hotpink',
    config: { ...config.stiff, precision: 0.01 },
    ref: springRef,
  })

  // 2. create transition-refs
  const transRef = useRef()
  const transitions = useTransition(open ? data : [], item => item.name, {
    from: { opacity: 0, transform: 'scale(0)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0)' },
    trail: 400 / data.length,
    config: { ...config.stiff, precision: 0.01, cancelDelay: true },
    unique: true,
    //reset: true,
    ref: transRef,
  })

  //console.log(open ? "container > I T E M S" : "I T E M S > container")

  const chain = [springRef, transRef]
  useChain(open ? chain : chain.reverse(), [0, open ? 0.1 : 0.5])

  return (
    <Main>
      <Sidebar
        style={{ ...rest, width: size, height: size }}
        onClick={() => set(open => !open)}>
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
  box-sizing: border-box;
`

const Sidebar = styled(animated.div)`
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  grid-gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 5px;
  cursor: pointer;
  will-change: width, height;
  box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
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
  will-change: transform, opacity;
`
