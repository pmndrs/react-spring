import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../theme-contract.css'
import { BREAKPOINTS } from '../breakpoints.css'
import { recipe } from '@vanilla-extract/recipes'
import { inlineLink } from '../utilities.css'

export const h1 = style({
  marginBottom: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginBottom: vars.space['30'],
    },
  },
})

export const h2 = style({
  marginTop: vars.space['30'],
  marginBottom: vars.space['15'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['40'],
      marginBottom: vars.space['20'],
    },
  },
})

export const h3 = style({
  marginTop: vars.space['30'],
  marginBottom: vars.space['15'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['40'],
      marginBottom: vars.space['20'],
    },
  },
})

export const h4 = style({
  marginTop: vars.space['30'],
  marginBottom: vars.space['15'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['40'],
      marginBottom: vars.space['20'],
    },
  },
})

export const h5 = style({
  marginTop: vars.space['30'],
  marginBottom: `0.4rem`,
  textTransform: 'uppercase',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['40'],
      marginBottom: '0.6rem',
    },
  },
})

export const p = style({
  selectors: {
    '& + &': {
      marginTop: vars.space['15'],
    },

    'pre + &': {
      marginTop: vars.space['30'],
    },
  },

  maxWidth: 680,
})

globalStyle(`${p} + pre`, {
  marginTop: vars.space['40'],
  marginBottom: vars.space['40'],
})

globalStyle(`${p} code`, {
  backgroundColor: vars.colors.steel20,
  borderRadius: vars.radii.r4,
  padding: '0.2rem 0.5rem',
})

globalStyle(`${p} > a`, {
  position: 'relative',
  textDecoration: 'none',
})

globalStyle(`${p} > a:after`, {
  position: 'absolute',
  bottom: -1,
  left: 0,
  content: '',
  width: '100%',
  height: 2,
  backgroundColor: vars.colors.red100,

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'width 200ms ease-out',
    },
  },
})

globalStyle(`${p} > a:hover:after`, {
  width: '0%',
})

export const list = style({
  marginTop: vars.space['15'],
})

export const grid = style({
  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'grid',
      maxHeight: '100%',
      overflow: 'hidden',
      gridTemplateColumns: '30rem 1fr 1fr',
      gridTemplateAreas: `
                "header header header"
                "aside main main"
            `,
    },
  },
})

globalStyle(`${grid} > header`, {
  gridArea: 'header',
})

export const main = style({
  position: 'relative',
  flex: '1',
  gridArea: 'main',
  width: '100%',
  margin: '0 auto',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      maxWidth: 'calc(100vw - 30rem)',
    },
  },
})

export const mainStickyMenu = style({
  width: 'inherit',
  maxWidth: 'inherit',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'flex',
    },
  },
})

export const article = recipe({
  base: {
    padding: `0 ${vars.space['25']} ${vars.space['30']} ${vars.space['25']}`,
    width: '100%',
    marginTop: vars.space['15'],

    '@media': {
      [`screen and ${BREAKPOINTS.tabletUp}`]: {
        padding: `0 6.2rem ${vars.space['80']} 6.2rem`,
        maxWidth: vars.sizes.document,
        margin: '0 auto',
        marginTop: vars.space['25'],
      },
    },
  },

  variants: {
    hasStickySubnav: {
      false: {
        paddingTop: 27,
      },
    },
  },
})

export const footer = style({
  marginTop: vars.space['40'],
})

export const editAnchor = style([
  {},
  {
    fontSize: vars.fontSizes.XXS,
    lineHeight: vars.lineHeights.XXS,
    textDecoration: 'none',
    fontWeight: vars.fontWeights.default,
    color: vars.colors.steel40,
    display: 'inline-flex',
    alignItems: 'center',
  },
])

globalStyle(`${editAnchor} > span`, {
  marginLeft: vars.space['5'],
})

globalStyle(`${editAnchor}:hover > span`, {
  textDecoration: 'underline',
})

export const blockQuote = style({
  margin: `${vars.space['30']} 0`,
  position: 'relative',
  marginLeft: vars.space['20'],
  opacity: 0.7,

  ':before': {
    content: '""',
    height: '100%',
    width: 1,
    backgroundColor: vars.colors.black,
    position: 'absolute',
    top: 0,
    left: -20,
  },
})
