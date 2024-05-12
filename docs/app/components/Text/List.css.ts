import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const list = style({
  paddingLeft: vars.space['20'],
  fontWeight: vars.fontWeights.default,

  selectors: {
    '& code': {
      backgroundColor: vars.colors.steel20,
      borderRadius: vars.radii.r4,
      padding: '0.2rem 0.5rem',
    },
  },
})

export const descriptiveList = style({
  selectors: {
    '& code': {
      backgroundColor: vars.colors.steel20,
      borderRadius: vars.radii.r4,
      padding: '0.2rem 0.5rem',
    },

    '& > div': {
      display: 'flex',
      gap: vars.space['5'],
    },

    '& dt': {
      marginBottom: vars.space['5'],
      fontWeight: vars.fontWeights.default,
    },

    '& dd': {
      margin: 0,
      marginBottom: vars.space['15'],
    },
  },
})
