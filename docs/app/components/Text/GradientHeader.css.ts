import { style } from '@vanilla-extract/css'
import { darkThemeClass } from '../../styles/dark-theme.css'
import { vars } from '../../styles/theme-contract.css'

export const gradientHeader = style({
  display: 'inline',
  background: vars.colors.blueGreenGradient100,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  textFillColor: 'transparent',
  marginBottom: '0.4rem',

  selectors: {
    [`${darkThemeClass} &`]: {
      background: vars.colors.redYellowGradient100,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      // @ts-expect-error - this is a thing.
      textFillColor: 'transparent',
    },
  },
})
