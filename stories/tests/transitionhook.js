import React, { useEffect, useState } from 'react'
import { useTransition } from '../../src/targets/web/hooks'
import { animated } from '../../src/targets/web'
import { testStories } from '../index'
import { transitions } from 'polished'
import styled from 'styled-components'

function TestTransition() {
  const [items, setState] = useState([])

  useEffect(() => {
    setState(['Apples', 'Oranges', 'Bananas'])
    setTimeout(() => setState(['Apples', 'Bananas']), 1500)
    setTimeout(() => setState(['Apples', 'Oranges', 'Bananas']), 3000)
    setTimeout(() => setState(['Kiwis']), 4500)
  }, [])

  const transitions = useTransition({
    items,
    from: { height: 0, opacity: 0 },
    enter: { height: 50, opacity: 1, background: '#28d79f' },
    leave: { height: 0, opacity: 0, background: '#c23369' },
  })

  return (
    <Container>
      {transitions.map(({ item, props, key }) => (
        <Item key={key} style={props}>
          {item}
        </Item>
      ))}
    </Container>
  )
}

const Container = styled.div`
  background-color: #70C1B3;
  overflow: hidden;
  cursor: pointer;
  margin: 0;
  padding: 0;
`

const Item = styled(animated.div)`
  overflow: hidden;
  width: 100%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2em;
  font-family: Kanit, sans-serif;
  text-transform: uppercase;
`

testStories.add('Transitions Hook', () => <TestTransition />)
