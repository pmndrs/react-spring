import React from 'react'
import styled from 'styled-components'

export default function DemoGrid({ children, ...props }) {
  return <Container {...props}>{children}</Container>
}

const Container = styled('div')`
  position: relative;
  width: 100%;
  height: auto;
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  padding: ${props => props.padding || 0}px;
`
