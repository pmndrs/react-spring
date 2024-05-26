import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const field = style({
  display: 'inline-flex',
  alignItems: 'center',
  border: `solid 1px ${vars.colors.steel100}`,
  padding: 7,
  paddingLeft: 14,
  borderRadius: vars.radii.r8,
})

export const copyText = style({
  fontFamily: vars.fonts.mono,
})
