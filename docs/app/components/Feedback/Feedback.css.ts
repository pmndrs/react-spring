import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { recipe } from '@vanilla-extract/recipes'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const heading = style({
  color: vars.colors.steel40,
})

export const stack = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: vars.space['20'],
  marginTop: vars.space['15'],
  marginBottom: vars.space['40'],
})

export const trigger = recipe({
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'transparent',
    border: `solid 1px ${vars.colors.steel40}`,
    borderRadius: vars.radii.r8,
    padding: vars.space['10'],
    color: vars.colors.steel40,
    cursor: 'pointer',
    transition:
      'color 200ms ease-out, border-color 200ms ease-out, opacity 200ms ease-out',
    selectors: {
      '&:disabled': {
        pointerEvents: 'none',
        opacity: 0.5,
      },
    },
  },
  variants: {
    selected: {
      false: {
        selectors: {
          '&:hover': {
            borderColor: vars.colors.steel80,
            color: vars.colors.steel80,
          },
        },
      },
      true: {
        pointerEvents: 'none',
        borderColor: vars.colors.red100,
        color: vars.colors.red100,
      },
    },
  },
})

export const popoverContent = style({
  display: 'none',
  background: vars.colors.codeBackground,
  color: vars.colors.black,
  fontSize: vars.fontSizes.XXS,
  lineHeight: vars.lineHeights.XXS,
  overflow: 'hidden',
  boxShadow:
    'rgba(27,31,36,0.12) 0px 1px 3px, rgba(66,74,83,0.12) 0px 8px 24px',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'block',
      padding: vars.space['20'],
      borderRadius: vars.radii.r8,
      width: 320,
      fontSize: vars.fontSizes.XS,
      lineHeight: vars.lineHeights.XS,
    },
  },

  selectors: {
    [`${darkThemeClass} &`]: {
      boxShadow:
        'rgba(27,31,36,0.5) 0px 1px 3px, rgba(18 21 23 / 40%) 0px 8px 24px',
    },
  },
})

export const popoverHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: vars.space['10'],
  gap: vars.space['10'],
})

globalStyle(`${popoverHeader} > h2`, {
  lineHeight: vars.lineHeights.code,
})

export const popoverClose = style({
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  padding: vars.space['5'],
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '@supports': {
    '(hover:hover)': {
      selectors: {
        '&:hover': {
          color: vars.colors.red100,
        },
      },
    },
  },
})

export const popoverInputLabel = style({
  display: 'block',
  marginBottom: vars.space['15'],
})

export const popoverInput = style({
  borderRadius: vars.radii.r8,
  margin: 0,
  padding: `${vars.space['5']} ${vars.space['10']}`,
  width: '100%',
  backgroundColor: 'transparent',
  border: `1px solid ${vars.colors.steel40}`,
  alignItems: 'center',
  transition: 'border-color 200ms ease-out',
  color: vars.colors.black,
  fontSize: 12,
  fontWeight: 400,
  lineHeight: '140%',

  '@supports': {
    '(hover:hover)': {
      selectors: {
        '&:hover': {
          borderColor: vars.colors.red100,
        },
      },
    },
  },

  selectors: {
    '&:disabled': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
    '&:disabled:hover': {
      borderColor: vars.colors.steel40,
    },
  },
})

export const popoverFormFooter = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

export const popoverButton = style({
  cursor: 'pointer',

  selectors: {
    '&[aria-disabled="true"]': {
      opacity: 0.5,
      pointerEvents: 'none',
    },
  },
})

globalStyle(`${popoverButton} > span`, {
  background: vars.colors.codeBackground,
})

export const outbound = style({
  selectors: {
    [`.${darkThemeClass} &::before`]: {
      background: vars.colors.redYellowGradient100,
    },

    [`.${darkThemeClass} &:hover:before`]: {
      filter: 'brightness(120%)',
    },
  },
})

globalStyle(`${popoverButton} > span`, {
  background: vars.colors.codeBackground,
})
