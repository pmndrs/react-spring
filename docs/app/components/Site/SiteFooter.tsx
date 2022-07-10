import { styled } from '~/styles/stitches.config'

export const SiteFooter = () => {
  return (
    <Footer>
      <FooterCopy>
        Designed & built by{' '}
        <a
          href="https://twitter.com/_josh_ellis_"
          rel="noopener noreferrer"
          target="_blank">
          Josh
        </a>
        {'. '}
        Powered by –{' '}
        <a
          href="https://www.netlify.com/"
          rel="noopener noreferrer"
          target="_blank">
          Netlify
        </a>
        ,{' '}
        <a href="https://remix.run/" rel="noopener noreferrer" target="_blank">
          Remix
        </a>
        ,{' '}
        <a
          href="https://www.algolia.com/"
          rel="noopener noreferrer"
          target="_blank">
          Algolia
        </a>
        ,{' '}
        <a
          href="https://plausible.io"
          rel="noopener noreferrer"
          target="_blank">
          Plausible
        </a>
        ,{' '}
        <a
          href="https://stitches.dev/"
          rel="noopener noreferrer"
          target="_blank">
          Stitches
        </a>{' '}
        & more...
      </FooterCopy>
      <FooterCopy>{`© 2022 react-spring`}</FooterCopy>
    </Footer>
  )
}

const Footer = styled('footer', {
  px: '$25',
  py: '$20',
  mt: '$50',

  '@tabletUp': {
    mt: '$100',
    px: '$50',
    display: 'flex',
    justifyContent: 'space-between',
  },
})

const FooterCopy = styled('p', {
  color: '$steel40',
  fontSize: '1.2rem',
  lineHeight: '180%',
  fontWeight: '$default',

  '& > a': {
    hover: {
      textDecoration: 'underline',
    },
  },
})
