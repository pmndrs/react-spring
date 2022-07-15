import React, { useEffect } from 'react'
import styled from 'styled-components'

import { Nav } from 'components/Navigation'
import { useRouter } from 'next/router'

interface PageContainerProps {}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const router = useRouter()

  console.log(router.pathname)

  useEffect(() => {
    const handleRouteChangeFinish = () => {
      const element = document.getElementById('#carbonads')
      // @ts-ignore
      if (typeof window._carbonads !== 'undefined' || !element) {
        // @ts-ignore
        window._carbonads.refresh()
      }
    }
    router.events.on('routeChangeComplete', handleRouteChangeFinish)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeFinish)
    }
  }, [router])

  return (
    <Wrapper id="router">
      <NavSpace>
        <script
          async
          type="text/javascript"
          src="//cdn.carbonads.com/carbon.js?serve=CEAIPK7I&placement=react-springdev"
          id="_carbonads_js"
        />
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
  display: flex;
  flex-direction: column-reverse;

  @media (min-width: 768px) {
    width: 300px;
    display: unset;
  }
`

const Content = styled.aside`
  width: 60vw;
  padding: 0 40px;

  @media (max-width: 899px) {
    width: 100vw;
    padding: 0 12px;
  }
`
