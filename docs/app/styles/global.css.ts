import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme-contract.css'
import { BREAKPOINTS } from './breakpoints.css'

export default globalStyle('html, body', {
  color: vars.colors.black,
  backgroundColor: vars.colors.white,

  fontFamily: vars.fonts.sans,
  fontKerning: 'normal',
  fontSize: '62.5%',
  letterSpacing: '-0.005em',

  WebkitFontSmoothing: 'antialiased',

  margin: 0,
  minHeight: '100%',

  '@supports': {
    '(font-variation-settings: normal)': {
      fontFamily: vars.fonts['sans-var'],
    },
  },

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      scrollBehavior: 'smooth',
    },
  },
})

globalStyle('*, *:before, *:after', {
  boxSizing: 'border-box',
})

globalStyle('html', {
  display: 'flex',
})

globalStyle('body', {
  flex: '1 0 100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  maxWidth: '100%',
})

globalStyle('h1, h2, h3, h4, h5, h6, p', {
  margin: 0,
})

globalStyle('button, a', {
  color: 'inherit',
  textDecoration: 'none',
})

globalStyle('*:focus-visible', {
  boxShadow: `0 0 0 3px ${vars.colors['red-outline']}`,
  outline: 'none',
  borderRadius: vars.radii.r4,
})

globalStyle('#carbonads', {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  display: 'flex',
  justifyContent: 'stretch',
  margin: '0 auto',
  marginBottom: 40,
  backgroundColor: vars.colors.codeBackground,
  borderRadius: vars.radii.r8,
  overflow: 'hidden',
  boxShadow: '0 1px 4px 1px hsla(0, 0%, 0%, 0.1)',
  zIndex: 100,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      maxWidth: '60%',
    },
  },
})

globalStyle('#carbonads *', {
  margin: 'initial',
  padding: 'initial',
})

globalStyle('#carbonads > span', {
  width: '100%',
})

globalStyle('#carbonads a', {
  color: 'inherit',
  textDecoration: 'none',
})

globalStyle('#carbonads a:hover', {
  color: 'inherit',
})

globalStyle('#carbonads span', {
  position: 'relative',
  display: 'block',
  overflow: 'hidden',
})

globalStyle('#carbonads .carbon-wrap', {
  display: 'flex',
})

globalStyle('#carbonads .carbon-img', {
  display: 'block',
  margin: 0,
  lineHeight: 1,
})

globalStyle('#carbonads .carbon-img img', {
  display: 'block',
})

globalStyle('#carbonads .carbon-text', {
  fontSize: '14px',
  padding: 10,
  marginBottom: 16,
  lineHeight: 1.5,
  textAlign: 'left',
})

globalStyle('#carbonads .carbon-poweredby', {
  display: 'block',
  padding: '6px 8px',
  background: vars.colors.white,
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontWeight: 600,
  fontSize: 8,
  lineHeight: 1,
  borderTopLeftRadius: 3,
  position: 'absolute',
  bottom: 0,
  right: 0,
})

globalStyle('.DocSearch', {
  fontSize: vars.fontSizes.XS,
})

globalStyle('.DocSearch-Container, .DocSearch-Container *', {
  pointerEvents: 'auto',
})

globalStyle('.DocSearch-Container', {
  backgroundColor: vars.colors.white80,
  borderRadius: vars.radii.r8,
})

globalStyle('.DocSearch-Modal', {
  boxShadow: 'unset',
  backgroundColor: vars.colors.codeBackground,
})

globalStyle('.DocSearch-MagnifierLabel', {
  display: 'none',
})

globalStyle('.DocSearch-Form', {
  padding: 0,
  background: 'transparent',
  boxShadow: 'unset',
  border: `1px solid ${vars.colors.steel40}`,
})

globalStyle('.DocSearch-Input', {
  fontSize: 'inherit',
  padding: `${vars.space['5']} 11px`,
  background: 'transparent',
  color: vars.colors.black,
})

globalStyle('.DocSearch-Input::placeholder', {
  color: vars.colors.black,
})

globalStyle('.DocSearch-Reset:hover', {
  color: vars.colors.steel40,
})

globalStyle('.DocSearch-Help', {
  fontSize: 'inherit',
  color: vars.colors.steel40,
})

globalStyle('.DocSearch-Dropdown', {
  minHeight: '20vh',
})

globalStyle('.DocSearch-Footer', {
  background: 'transparent',
  boxShadow: 'unset',
})

globalStyle('.DocSearch-Label', {
  color: vars.colors.steel40,
})

globalStyle('.DocSearch-Commands-Key', {
  background: 'transparent',
  border: `1px solid ${vars.colors.steel40}`,
  borderRadius: 4,
  padding: 4,
  height: 'unset',
  width: 'unset',
  boxShadow: 'unset',
})

globalStyle('.DocSearch-Hit-source', {
  background: 'transparent',
  color: vars.colors.black,
})

globalStyle('.DocSearch-Hit > a', {
  background: 'transparent',
  boxShadow: 'unset',
  borderRadius: vars.radii.r8,
})

globalStyle('.DocSearch-Hit > a:hover', {
  backgroundColor: vars.colors.red100,
})

globalStyle('.DocSearch-Hit[aria-selected=true] > a', {
  backgroundColor: vars.colors.red100,
})

globalStyle('.DocSearch-Hit-Container, .DocSearch-Prefill', {
  color: vars.colors.black,
})

globalStyle('.DocSearch-Hit-title', {
  fontSize: 'inherit',
})

globalStyle('.DocSearch mark', {
  color: vars.colors.red100,
})
