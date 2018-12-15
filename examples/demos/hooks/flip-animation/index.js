import React, { useState } from 'react'
import { useTransition, useSpring, animated } from 'react-spring/hooks'
import styled from 'styled-components'
import range from 'lodash/range'

const Sidebar = styled('div')`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-template-rows: repeat(auto-fill, 200px);
  grid-gap: 20px;
  padding: 20px;
`

const Item = styled(animated.div)`
  width: 100%;
  height: 200px;
  background: red;
`

const items = range(6)

export default function App() {
  const transitions = useTransition({
    items,
    from: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    enter: { opacity: 1, transform: 'translate3d(0,0px,0)' },
    leave: { opacity: 0, transform: 'translate3d(0,-40px,0)' },
    trail: 200
  })
  return (
    <Sidebar>
      {transitions.map(({ item, key, props }) => (
        <Item key={key} style={props} />
      ))}
    </Sidebar>
  )
}
