import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { recipe } from '@vanilla-extract/recipes'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const tableCell = style({
  fontFamily: vars.fonts.mono,
  fontSize: vars.fontSizes.XS,
  lineHeight: vars.lineHeights.XS,
  padding: `${vars.space['15']} 0`,
  paddingRight: vars.space['10'],
})

export const tableCellIsPropName = style({})

globalStyle(`${tableCell} code`, {
  borderRadius: vars.radii.r4,
  padding: '2px 5px',
  backgroundColor: vars.colors.steel20,
  color: vars.colors.steel80,

  [`${darkThemeClass} &`]: {
    color: vars.colors.steel40,
  },
})

globalStyle(`${tableCellIsPropName} > code`, {
  backgroundColor: '#ff6d6d33',
  color: vars.colors.red100,
})

export const tableCellIsThirdItem = style({
  display: 'none',

  [`screen and ${BREAKPOINTS.tabletUp}`]: {
    display: 'table-cell',
  },
})

export const popoverTrigger = style({
  background: 'transparent',
  border: 'none',
  padding: 0,
  margin: 0,
  marginLeft: vars.space['5'],
  cursor: 'pointer',
  width: 24,
  height: 24,
  borderRadius: vars.radii.r4,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  top: 3,

  '@media': {
    '(hover: hover)': {
      ':hover': {
        background: '#ff6d6d66',
      },
    },
  },
})

export const popoverArrow = style({
  fill: vars.colors.codeBackground,
})

export const popoverBaseContent = style({})

export const popoverContent = recipe({
  base: {
    fontFamily: vars.fonts['sans-var'],
    fontSize: vars.fontSizes.XXS,
    lineHeight: vars.lineHeights.XXS,
    padding: `${vars.space['10']} ${vars.space['15']}`,
    background: vars.colors.codeBackground,
    borderRadius: vars.radii.r8,

    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  },

  variants: {
    isProp: {
      true: {
        maxWidth: 265,
      },
      false: {
        maxWidth: 400,
        overflow: 'scroll',
      },
    },
  },
})

globalStyle(`${popoverBaseContent} code`, {
  borderRadius: vars.radii.r4,
  padding: '0.2rem 0.5rem',
  whiteSpace: 'nowrap',
})

globalStyle(`${popoverBaseContent} a`, {
  position: 'relative',
  textDecoration: 'none',
})

globalStyle(`${popoverBaseContent} a::after`, {
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

globalStyle(`${popoverBaseContent} a:hover::after`, {
  width: '0%',
})
