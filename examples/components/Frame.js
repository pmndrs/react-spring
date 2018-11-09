import React from 'react'
import slyed from 'styled-components'

const Frame = styled('div')`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  background: ${props =>
    props.spot
      ? 'radial-gradient(ellipse at center, #eef0f2 0%, #90a2b2 100%)'
      : 'linear-gradient(to top, #90a2b2 0%, #eef0f2 100%)'};
`

const Header = styled('div')`
  height: auto;
  color: red;
`

const Content = styled('div')`
  flex: 1;
  color: blue;
`

export default class extends React.Component {
  render() {
    return (
      <Frame>
        <Header>
          test
        </Header>
        <Content>

        </Content>
      </Frame>
    )
  }
}
