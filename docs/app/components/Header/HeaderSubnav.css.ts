import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { XXS } from '../../styles/fontStyles.css'

export const subNavContainer = style({
  margin: `${vars.space['30']} 0`,
  position: 'relative',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
})

export const subNavScroller = style({
  overflow: '-moz-scrollbars-none',
  overflowX: 'auto',
  margin: `0 -2.8rem`,
  padding: `0 2.8rem`,

  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      margin: 0,
      padding: 0,
    },
  },
})

const gradientShared = style({
  position: 'absolute',
  top: 0,
  height: '100%',
  width: '2rem',
})

export const gradientRight = style([
  gradientShared,
  {
    right: -28,
    backgroundImage: 'linear-gradient(90deg, $white0 0%, $white 100%)',

    '@media': {
      [`screen and ${BREAKPOINTS.tabletUp}`]: {
        right: 0,
      },
    },
  },
])

export const gradientLeft = style([
  gradientShared,
  {
    left: -28,
    backgroundImage: 'linear-gradient(90deg, $white 0%, $white0 100%)',

    '@media': {
      [`screen and ${BREAKPOINTS.tabletUp}`]: {
        left: 0,
      },
    },
  },
])

export const subNavList = style({
  listStyle: 'none',
  display: 'flex',
  margin: 0,
  padding: '0 0.4rem',
  gap: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      gap: vars.space['30'],
    },
  },
})

export const subNavListItem = style({
  ':last-child': {
    paddingRight: '2.8rem',
  },

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      ':last-child': {
        paddingRight: 0,
      },
    },
  },
})

export const subNavAnchor = style([
  XXS,
  {
    whiteSpace: 'nowrap',
  },
])
