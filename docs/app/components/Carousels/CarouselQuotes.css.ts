import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'

export const quotesSection = style({
  marginBottom: vars.space['10'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginBottom: vars.space['30'],
    },
  },
})

export const quoteHeading = style({
  padding: `0 ${vars.space['25']}`,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      padding: `0 ${vars.space['50']}`,
      margin: '0 auto',
      maxWidth: vars.sizes.largeDoc,
    },
  },
})

export const quotesContainer = style({
  display: 'flex',
  gap: vars.space['20'],
  alignItems: 'flex-start',
  overflow: 'auto',
  paddingTop: vars.space['20'],
  paddingBottom: vars.space['10'],
  paddingLeft: vars.space['25'],
  paddingRight: vars.space['25'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      paddingLeft: vars.space['50'],
      paddingRight: vars.space['50'],
    },
  },
})
