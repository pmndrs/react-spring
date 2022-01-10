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
  },

  'h1, h2, h3, h4, h5, h6, p': {
    margin: 0,
  },

  'button, a': {
    color: 'inherit',
    textDecoration: 'none',
  },

  '*:focus': {
    outline: '3px solid $red-outline',
    outlineOffset: '2px',
    borderRadius: '$r4',
    ['-webkit-tap-highlight-color']: '3px solid $red-outline',
  },

  [`${dark}`]: {},
})
