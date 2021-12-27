import { globalCss } from './stitches.config'

export const globalStyles = globalCss({
  '*, *:before, *:after': {
    boxSizing: 'border-box',
  },
  'html, body': {
    fontSize: '62.5%',
    color: '$black',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale',
    overflowX: 'hidden',
  },
})
