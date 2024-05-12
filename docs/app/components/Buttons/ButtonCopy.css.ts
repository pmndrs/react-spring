import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const animatedIcon = style({
  position: 'absolute',
  inset: 0,
})

export const absoluteContainer = style({
  display: 'block',
  position: 'relative',
  height: '100%',
  width: '100%',
})

export const copyButton = style({
  backgroundColor: vars.colors.codeBackground,
  border: 'none',
  padding: '4px 4px 1px 4px',
  height: 32,
  width: 32,
  overflow: 'hidden',
  borderRadius: vars.radii.r4,
  marginLeft: 14,
  cursor: 'pointer',

  '@media': {
    '(hover: hover)': {
      ':hover': {
        backgroundColor: vars.colors.red40,
      },

      selectors: {
        [`${darkThemeClass} &:hover`]: {
          backgroundColor: vars.colors.red40,
        },
      },
    },

    '(prefers-reduced-motion: no-preference)': {
      transition: 'background-color 250ms ease-out',
    },
  },
})
