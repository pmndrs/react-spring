import { createVar, globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const mobileHeight = createVar()

export const desktopHeight = createVar()

export const header = style({
  width: '100%',
  paddingTop: vars.space['15'],
  paddingBottom: vars.space['15'],
  zIndex: vars.zIndices['1'],

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'background-color 400ms ease-out',
    },

    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      paddingTop: vars.space['25'],
      paddingBottom: vars.space['25'],
    },
  },
})

export const headerSpacing = style({
  height: mobileHeight,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      height: desktopHeight,
    },
  },
})

globalStyle(`${header} + aside + main > article > h2`, {
  pointerEvents: 'none',
})

globalStyle(`${header} + aside + main > article > h2::before`, {
  display: 'block',
  content: ' ',
  marginTop: '-48px',
  height: '48px',
  visibility: 'hidden',
  pointerEvents: 'none',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: '-82px',
      height: '82px',
    },
  },
})

export const headerScrolledDown = style({
  backgroundColor: 'rgba(250, 250, 250, 0.80)',
  backdropFilter: 'blur(5px)',

  '@supports': {
    'not (backdrop-filter: blur(10px))': {
      backgroundColor: 'rgba(250, 250, 250, 0.95)',
    },
  },

  selectors: {
    [`${darkThemeClass} &`]: {
      backgroundColor: 'rgba(27, 26, 34, 0.8)',

      '@supports': {
        'not (backdrop-filter: blur(10px))': {
          backgroundColor: 'rgba(27, 26, 34, 0.95)',
        },
      },
    },
  },
})

export const headerStuck = style({
  position: 'fixed',
})

globalStyle(`${headerStuck} + aside + main`, {
  paddingTop: mobileHeight,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      paddingTop: desktopHeight,
    },
  },
})

export const headerTransparentBackground = style({
  backgroundColor: 'transparent',
  backdropFilter: 'unset',
})

export const headerAddMarginToMain = style({})

globalStyle(`${header} + main`, {
  paddingTop: vars.space['10'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      paddingTop: vars.space['20'],
    },
  },
})

export const flexContainer = style({
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: `0 ${vars.space['25']}`,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      flexDirection: 'row',
      padding: `0 ${vars.space['50']}`,
    },
  },
})

globalStyle(`${flexContainer} + header`, {
  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'none',
    },
  },
})

export const desktopNavigation = style({
  display: 'none',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'flex',
    },
  },
})

export const mobileMenuButton = style({
  margin: 0,
  padding: '0.8rem 0.8rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  marginLeft: '-0.8rem',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'none',
    },
  },
})

export const hamburgerMenu = style({
  color: vars.colors.black,
})
