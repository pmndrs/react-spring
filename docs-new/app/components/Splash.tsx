import { styled } from '../styles/stitches.config'

import { Logo } from './Logo'

export const Splash = () => {
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

const Container = styled('header', {
  position: 'relative',
  width: '100%',
  height: '80vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column-reverse',
  alignItems: 'space-around',
  justifyContent: 'center',
  backgroundColor: '$steel',
  color: '$white',
  borderRadius: '0 0 $r20 $r20',
  padding: '$25',
  backgroundSize: '40px 40px',
  backgroundImage: `linear-gradient(to right,rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,

  '@tabletUp': {
    flexDirection: 'row',
    padding: '$50',
  },
})

const Column = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  '@tabletUp': {
    flex: 1,
    maxWidth: '$splash',

    '&:first-child': {
      marginRight: '12rem',
    },
  },
})

const LogoContainer = styled('div', {
  width: '50%',
  userSelect: 'none',
  marginBottom: '$25',

  '@tabletUp': {
    width: '100%',
    margin: 0,
  },
})

const QuickNav = styled('ul', {
  marginTop: '$25',
})

const QuickNavAnchor = styled('a', {
  display: 'inline-block',
  background: '$red',
  color: '$white',
  borderRadius: '$r20',
})

const TitleContainer = styled('div', {
  textAlign: 'center',
  marginBottom: '$25',

  '@tabletUp': {
    margin: 0,
    textAlign: 'right',
  },
})

const Title = styled('h1', {
  fontWeight: '$bold',
  color: '$white',
  fontSize: '$XL',
  lineHeight: '$XL',

  '@tabletUp': {
    fontSize: '$XXL',
    lineHeight: '$XXL',
  },
})

const Tagline = styled('p', {
  color: '$white',
  fontSize: '$S',
  lineHeight: '$S',
  marginTop: '$20',
})
