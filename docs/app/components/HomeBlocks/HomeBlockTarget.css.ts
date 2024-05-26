import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const list = style({
  margin: `8 0`,
  paddingLeft: 26,
})

export const homeBlockCode = style({
  marginTop: vars.space['40'],
  position: 'relative',
})
