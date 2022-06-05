import { styled } from '~/styles/stitches.config'
import { Copy } from '../Text/Copy'

export const SiteFooter = () => {
  return (
    <Footer>
      <FooterCopy>
        Powered by –{' '}
        <a href="https://vercel.com/" rel="noopener noreferrer" target="_blank">
          Vercel
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
