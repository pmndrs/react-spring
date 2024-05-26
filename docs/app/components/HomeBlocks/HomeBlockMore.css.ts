import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const list = style({
  margin: 0,
  paddingLeft: 26,
})

export const listItem = style({
  cursor: 'pointer',
})

export const homeBlockCode = style({
  marginTop: vars.space['40'],
  position: 'relative',
})
