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

    '@motion': {
      scrollBehavior: 'smooth',
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

  '.DocSearch': {
    fontSize: '$XS',

    '&.DocSearch-Container, &.DocSearch-Container *': {
      pointerEvents: 'auto',
    },

    '&.DocSearch-Container': {
      backgroundColor: '$white80',
      borderRadius: '$r8',
    },

    '.DocSearch-Modal': {
      boxShadow: 'unset',
      backgroundColor: '$codeBackground',
    },

    '.DocSearch-MagnifierLabel': {
      display: 'none',
    },

    '.DocSearch-Form': {
      p: 0,
      background: 'transparent',
      boxShadow: 'unset',
      border: '1px solid $steel40',
    },

    '.DocSearch-Input': {
      fontSize: 'inherit',
      p: '$5 11px',
      background: 'transparent',
      color: '$black',

      '&::placeholder': {
        color: '$black',
      },
    },

    '.DocSearch-Reset:hover': {
      color: '#ff6d6dcc',
    },

    '.DocSearch-Help': {
      fontSize: 'inherit',
      color: '$steel40',
    },

    '.DocSearch-Dropdown': {
      minHeight: '20vh',
    },

    '.DocSearch-Footer': {
      background: 'transparent',
      boxShadow: 'unset',
    },

    '.DocSearch-Label': {
      color: '$steel40',
    },

    '.DocSearch-Commands-Key': {
      background: 'transparent',
      border: '1px solid $steel40',
      borderRadius: 4,
      p: 4,
      height: 'unset',
      width: 'unset',
      boxShadow: 'unset',
    },

    '.DocSearch-Hit-source': {
      background: 'transparent',
      color: '$black',
    },

    '.DocSearch-Hit > a': {
      background: 'transparent',
      boxShadow: 'unset',
      borderRadius: '$r8',

      hover: {
        backgroundColor: '#ff6d6d33',
      },
    },

    '.DocSearch-Hit[aria-selected=true] > a': {
      backgroundColor: '#ff6d6d33',
    },

    '.DocSearch-Hit-Container, .DocSearch-Prefill': {
      color: '$black',
    },

    '.DocSearch-Hit-title': {
      fontSize: 'inherit',
    },

    mark: {
      color: '$red100',
    },
  },

  [`${dark}`]: {},
})
