import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'

export const footer = style({
  padding: `${vars.space['25']} ${vars.space['20']}`,
  marginTop: vars.space['50'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['100'],
      paddingLeft: `${vars.space['50']}`,
      paddingRight: `${vars.space['50']}`,
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
  },
})

export const copy = style({
  color: vars.colors.steel40,
  fontSize: '1.2rem',
  lineHeight: '180%',
  fontWeight: vars.fontWeights.default,
})

export const anchor = style({
  '@media': {
    '(hover: hover)': {
      ':hover': {
        textDecoration: 'underline',
      },
    },
  },
})
