import { style } from '@vanilla-extract/css'
import { vars } from '../styles/theme-contract.css'
import { darkThemeClass } from '../styles/dark-theme.css'

export const badge = style({
  fontSize: '1.2rem',
  lineHeight: '1.2rem',
  fontWeight: vars.fontWeights.bold,
  padding: '0.6rem 0.4rem',
  borderRadius: vars.radii.r8,
  color: vars.colors.white,
  background: vars.colors.blueGreenGradient100,

  selectors: {
    [`${darkThemeClass} &`]: {
      background: vars.colors.redYellowGradient100,
    },
  },
})
