import React, { useState } from 'react'
import styled from 'styled-components'

export default function DemoGrid({ children, ...props }) {
  const [intersects, set] = useState(false)
  return <Container {...props}>{children}</Container>
}

const Container = styled('div')`
  position: relative;
  width: 100%;
  height: ${props => (props.fullscreen ? '100%' : 'auto')};
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  padding: ${props => (props.padding !== void 0 ? props.padding : 40)}px;
  user-select: none;

  & > div:last-of-type:nth-child(odd) {
    grid-column: 1/-1;
  }
`
