import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const block = style({
  maxWidth: 630,
})

export const blockCopy = style({
  padding: `${vars.space['20']} 0`,
  maxWidth: 600,
})
