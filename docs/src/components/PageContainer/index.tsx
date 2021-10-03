import React, { useEffect } from 'react'
import styled from 'styled-components'

import { Nav } from 'components/Navigation'

interface PageContainerProps {}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Wrapper id="router">
      <NavSpace>
        <Nav />
      </NavSpace>
      <Content className="markdown-body">{children}</Content>
    </Wrapper>
  )
}

export const Wrapper = styled.div`
  padding-top: 20px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 899px) {
    flex-direction: column;
  }
`

const NavSpace = styled.aside`
  padding: 20px;
  width: 300px;
`

const Content = styled.aside`
  width: 60vw;
  padding: 0 40px;

  @media (max-width: 899px) {
    width: 100vw;
    padding: 0 12px;
  }
`
