import React, { useState, useRef } from 'react'
import { useTransition, useSpring, animated, useChain } from 'react-spring/hooks'
import styled from 'styled-components'
import range from 'lodash/range'



export default function App () {
  const [open, set] = useState(true)
  const [items] = useState(() => range(5))

  // 1. create spring-refs, which will refer to the springs Controller
  const springRef = useRef()
  const props = useSpring({
    from: { opacity: 0, transform: `translate3d(-100%,0,0)` },
    opacity: open ? 1 : 0,
    transform: `translate3d(${open ? 0 : -100}%,0,0)`,
    ref: springRef
  })

  // 2. create transition-refs
  const transRef = useRef()
  const transitions = useTransition({
    items: open ? items : [],
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    config: { mass: 5, tension: 500, friction: 90 },
    trail: 500 / items.length,
    unique: true,
    ref: transRef
  })

  useChain(open ? [springRef, transRef] : [transRef, springRef], [open])

  return (
    <Main onClick={() => set(open => !open)}>
      <Sidebar style={props}>
        {transitions.map(({ item, key, props }) => (
          <Item key={key} style={props} />
        ))}
      </Sidebar>
    </Main>
  )
}

const Main = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
`

const Sidebar = styled(animated.div)`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20px, 1fr));
  grid-template-rows: repeat(auto-fill, 20px);
  grid-gap: 10px;
  padding: 10px;
  background: lightgrey;
  overflow-y: scroll;
`

const Item = styled(animated.div)`
  width: 100%;
  height: 20px;
  background: hotpink;
`
