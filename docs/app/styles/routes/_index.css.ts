import { style } from '@vanilla-extract/css'
import { vars } from '../theme-contract.css'
import { BREAKPOINTS } from '../breakpoints.css'

export const mainHeader = style({
  paddingBottom: vars.space['15'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      paddingBottom: vars.space['25'],
    },
  },
})

export const externalLinkGrid = style({
  margin: `0 ${vars.space['25']}`,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      margin: `0 ${vars.space['50']}`,
    },
  },
})

export const main = style({
  width: '100%',
  overflowX: 'hidden',
})

export const maxWrapper = style({
  maxWidth: vars.sizes.largeDoc,
  margin: '0 auto',
})

export const homeBlocks = style({
  margin: `${vars.space['40']} 0`,

  [`screen and ${BREAKPOINTS.tabletUp}`]: {
    marginTop: vars.space['100'],
    marginBottom: vars.space['80'],
  },
})
