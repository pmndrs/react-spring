import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

/**
 * TODO: add anchor hover & active states
 * and maybe a nice animation to go with it
 */
export const anchor = style({
  fontSize: 'inherit',
  lineHeight: 'inherit',
  fontWeight: vars.fontWeights.bold,
  textDecoration: 'underline',
})
