import { style } from '@vanilla-extract/css'
import { vars } from '../theme-contract.css'
import { BREAKPOINTS } from '../breakpoints.css'

export const main = style({
  width: '100%',
  height: '100%',
  overflowX: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  marginTop: vars.space['40'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['100'],
    },
  },
})

export const pre = style({
  fontSize: 'clamp(2px, 1vw, 8px)',
  transform: 'translateX(clamp(1px, 17vw, 130px))',
})

export const errorHeading = style({
  marginTop: vars.space['10'],
  marginBottom: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: vars.space['20'],
      marginBottom: vars.space['40'],
    },
  },
})
