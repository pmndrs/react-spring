import { ArrowCircleRight } from 'phosphor-react'

import { styled } from '~/styles/stitches.config'

import { Button } from '../Buttons/Button'
import { Heading } from '../Text/Heading'
import { CodeField } from '../Fields/FieldCode'

import { useWindowSize } from '~/hooks/useWindowSize'
import { css } from '@stitches/react'
import { Copy } from '../Text/Copy'

export const HeroHome = () => {
  const { width, height } = useWindowSize()

  return (
    <Header
      style={{
        width: width ? width * 2 : undefined,
        height: height ? height * 2 : undefined,
      }}>
      <TitleTop style={{ width, height }}>
        <TitleContent>
          <Heading tag="h1" fontStyle="$XXL">
            With naturally fluid animations you will elevate your UI &
            interactions. Bringing your apps to life has never been simpler.
          </Heading>
          <TopFields>
            <CodeField />
            <NavLink variant="large" href="/docs/getting-started">
              <span>Get started</span>
              <ArrowCircleRight size={24} color="var(--colors-steel100)" />
            </NavLink>
          </TopFields>
        </TitleContent>
      </TitleTop>
      <TitleBottom style={{ width, height }}>
        <Left>
          <Heading tag="h2" fontStyle="$L">
            Why Springs?
          </Heading>
          <Copy
            fontStyle="$M"
            css={{
              mt: '$25',
              whiteSpace: 'pre-line',
            }}>
            {`We think of animation in terms of time and curves, but that causes most of the struggle we face when trying to make elements on the screen move naturally, because nothing in the real world moves like that. \n\nSprings don’t have a defined curve or a set duration.`}
          </Copy>
        </Left>
        <Right>
          <Copy fontStyle="$M">
            {`As Andy Matuschak (ex Apple UI-Kit developer) expressed – “Animation APIs parameterized by duration and curve are fundamentally opposed to continuous, fluid interactivity.”`}
          </Copy>
        </Right>
      </TitleBottom>
    </Header>
  )
}

const Header = styled('header', {
  position: 'relative',
  height: '200vh',
  width: '100vw',
})

const TitleTop = styled('div', {
  position: 'absolute',
  height: '100vh',
  width: '100vw',
  top: 0,
  left: 0,
})

const TitleContent = styled('div', {
  maxWidth: '$type',
  px: '$25',
  pt: '$100',

  '@tabletUp': {
    px: '$50',
    pt: 175,
  },
})

const TopFields = styled('div', {
  mt: '$40',

  '@tabletUp': {
    display: 'flex',
    gap: '$20',
  },
})

const NavLink = styled(Button, {
  mt: '$20',

  '& > span': {
    mr: 12,
  },

  '@tabletUp': {
    mt: 0,
  },

  /**
   * TODO: think about this... maybe its okay?
   */
  //   hover: {
  //     '& polyline, & line': {
  //       stroke: '$red100',
  //     },
  //   },

  //   '@motion': {
  //     '& polyline, & line': {
  //       transition: 'stroke 200ms ease-out',
  //     },
  //   },
})

const TitleBottom = styled('div', {
  position: 'absolute',
  height: '100vh',
  width: '100vw',
  bottom: 0,
  left: 0,
  px: '$25',

  '@tabletUp': {
    px: '$50',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
})

const Left = styled('div', {
  maxWidth: 630,
})

const Right = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',

  '@tabletUp': {
    maxWidth: 630,
    pb: 192,
  },
})
