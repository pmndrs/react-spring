import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../theme-contract.css'
import { BREAKPOINTS } from '../breakpoints.css'

export const main = style({
  padding: `0 ${vars.space['25']}`,
  width: '100%',
  margin: '0 auto',
  maxWidth: vars.sizes.largeDoc,
  flexGrow: 1,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      padding: `0 ${vars.space['15']}`,
    },

    [`screen and ${BREAKPOINTS.desktopUp}`]: {
      padding: `0 ${vars.space['50']}`,
    },
  },
})

export const flex = style({
  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: vars.space['40'],
    },
  },
})

globalStyle(`${flex} #carbonads`, {
  marginBottom: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      maxWidth: 400,
      marginBottom: vars.space['40'],
    },
  },
})

export const sandboxesList = style({
  display: 'grid',
  gridRowGap: vars.space['20'],
  margin: 0,
  padding: 0,
  listStyle: 'none',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridColumnGap: vars.space['20'],
    },

    [`screen and ${BREAKPOINTS.desktopUp}`]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
  },
})

export const exampleFilters = style({
  marginBottom: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginBottom: vars.space['40'],
    },
  },
})

export const xlHeading = style({
  marginBottom: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginBottom: vars.space['30'],
    },
  },
})

export const copy = style({
  maxWidth: 680,
})

export const h2 = style({
  display: 'inline',
  marginLeft: -6,
})

globalStyle(`${copy} > a, ${h2} > a`, {
  position: 'relative',
  textDecoration: 'none',
})

globalStyle(`${h2} > a`, {
  fontWeight: vars.fontWeights.bold,
})

globalStyle(`${copy} > a:after, ${h2} > a:after`, {
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

globalStyle(`${copy} > a:hover:after, ${h2} > a:hover:after`, {
  width: '0%',
})
