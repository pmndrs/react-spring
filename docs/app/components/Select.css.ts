import { style } from '@vanilla-extract/css'
import { vars } from '../styles/theme-contract.css'
import { BREAKPOINTS } from '../styles/breakpoints.css'
import { darkThemeClass } from '../styles/dark-theme.css'
import { recipe } from '@vanilla-extract/recipes'

export const controlDiv = recipe({
  base: {
    background: 'transparent',
    fontWeight: vars.fontWeights.default,
    cursor: 'pointer',
  },
  variants: {
    isFocused: {
      true: {
        borderBottom: `solid 2px ${vars.colors.red100}`,
      },
      false: {
        borderBottom: `solid 2px ${vars.colors.black}`,
      },
    },
  },
})

export const placeholderSpan = style({
  fontSize: vars.fontSizes.XXS,
  lineHeight: vars.lineHeights.XXS,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.XS,
      lineHeight: vars.lineHeights.XS,
    },
  },
})

export const menuBackground = style({
  backgroundColor: vars.colors.white,
  opacity: 0.2,
  position: 'absolute',
  inset: 0,
  zIndex: vars.zIndices['1'],
})

export const menu = style({
  position: 'absolute',
  zIndex: vars.zIndices['2'],
  background: vars.colors.codeBackground,
  color: vars.colors.black,
  fontSize: vars.fontSizes.XXS,
  lineHeight: vars.lineHeights.XXS,
  overflow: 'hidden',
  boxShadow:
    'rgba(27,31,36,0.12) 0px 1px 3px, rgba(66,74,83,0.12) 0px 8px 24px',
  width: '100%',
  borderTopRightRadius: vars.radii.r8,
  borderTopLeftRadius: vars.radii.r8,
  bottom: 0,
  left: 0,

  [`${darkThemeClass} &`]: {
    boxShadow:
      'rgba(27,31,36,0.5) 0px 1px 3px, rgba(18 21 23 / 40%) 0px 8px 24px',
  },

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      bottom: 'unset',
      borderRadius: vars.radii.r8,
      width: 200,
      fontSize: vars.fontSizes.XS,
      lineHeight: vars.lineHeights.XS,
    },
  },
})

export const option = style({
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${vars.space['10']} ${vars.space['40']} ${vars.space['10']} ${vars.space['20']}`,
})
