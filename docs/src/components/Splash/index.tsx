import React from 'react'
import styled from 'styled-components'
import { MEDIA_QUERIES } from 'styles/mediaQueries'
import { Logo } from '../Logo'

export const Header = () => {
  return (
    <Container>
      <Column>
        <TitleContainer>
          <Title>react-spring</Title>
          <Tagline>
            bring your components to life with simple spring animation
            primitives
          </Tagline>
          <QuickNav>
            <QuickNavAnchor
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://github.com/pmndrs/react-spring/discussions">
              <span>community</span>
            </QuickNavAnchor>
            <QuickNavAnchor
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://github.com/pmndrs/react-spring">
              <span>source</span>
            </QuickNavAnchor>
            <QuickNavAnchor
              target="_blank"
              rel="nofollow noopener noreferrer"
              href="https://twitter.com/pmndrs">
              <span>twitter</span>
            </QuickNavAnchor>
          </QuickNav>
        </TitleContainer>
      </Column>
      <Column>
        <LogoContainer>
          <Logo width="100%" />
        </LogoContainer>
      </Column>
    </Container>
  )
}

const Container = styled.header`
  position: relative;
  background: ${props => props.theme.colors.steel};
  color: ${props => props.theme.colors.white};
  border-radius: 0 0 20px 20px;

  width: 100%;
  height: calc(60vh);

  display: flex;
  flex-direction: column-reverse;
  align-items: space-around;
  justify-content: center;
  padding: ${props => props.theme.padding['25']};

  background-size: 40px 40px;
  background-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);

  ${MEDIA_QUERIES.tabletUp} {
    flex-direction: row;
    padding: ${props => props.theme.padding['50']};
  }
`

const Column = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  ${MEDIA_QUERIES.tabletUp} {
    flex: 1;
    max-width: ${props => props.theme.wrappers.splash};

    &:first-child {
      margin-right: 120px;
    }
  }
`

const LogoContainer = styled.div`
  margin: 0 0 24px 0;
  width: 50%;
  user-select: none;

  ${MEDIA_QUERIES.tabletUp} {
    width: 100%;
    margin: 0;
  }
`

const QuickNav = styled.div`
  margin-top: 24px;
`

const QuickNavAnchor = styled.a`
  display: inline-block;
  background: ${props => props.theme.colors.red};
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.XS};
  line-height: ${props => props.theme.lineHeights.XS};
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 18px;
  margin-left: 16px;
  transition: background 400ms ease-out;

  &:hover {
    background: ${props => props.theme.colors.redHover};
  }

  &:first-child {
    margin-left: 0;
  }

  & span {
    position: relative;
    bottom: 1px;
  }
`

const TitleContainer = styled.div`
  text-align: center;
  margin-bottom: 24px;

  ${MEDIA_QUERIES.tabletUp} {
    margin: 0;
    text-align: right;
  }
`

const Title = styled.h1`
  font-weight: 600;
  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.XL};
  line-height: ${props => props.theme.lineHeights.XL};

  ${MEDIA_QUERIES.tabletUp} {
    font-size: ${props => props.theme.fontSizes.XXL};
    line-height: ${props => props.theme.lineHeights.XXL};
  }
`

const Tagline = styled.p`
  margin-top: 16px;

  color: ${props => props.theme.colors.white};
  font-size: ${props => props.theme.fontSizes.S};
  line-height: ${props => props.theme.lineHeights.S};
`
