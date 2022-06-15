import { dark, globalCss } from './stitches.config'

export const globalStyles = globalCss({
  '*, *:before, *:after': {
    boxSizing: 'border-box',
  },

  'html, body': {
    color: '$black',
    backgroundColor: '$white',

    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
    fontFamily: '$sans',
    fontKerning: 'normal',
    fontSize: '62.5%',
    letterSpacing: '-0.005em',

    margin: 0,
    minHeight: '100%',

    '@supports(font-variation-settings: normal)': {
      fontFamily: '$sans-var',
    },

    scrollBehavior: 'smooth',

    '@motion': {
      scrollBehavior: 'initial',
    },
  },

  html: {
    display: 'flex',
  },

  body: {
    flex: '1 0 100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '100%',
  },

  'h1, h2, h3, h4, h5, h6, p': {
    margin: 0,
  },

  'button, a': {
    color: 'inherit',
    textDecoration: 'none',
  },

  '*:focus': {
    boxShadow: '0 0 0 3px $red-outline',
    outline: 'none',
    borderRadius: '$r4',

    ['-webkit-tap-highlight-color']: '3px solid $red-outline',
  },

  [`${dark}`]: {},
})
