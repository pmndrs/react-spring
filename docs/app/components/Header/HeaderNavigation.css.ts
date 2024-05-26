import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const navList = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  gap: vars.space['10'],
})

export const navSeperator = style({
  width: '0.1rem',
  background: vars.colors.steel40,
  margin: `0 ${vars.space['15']}`,
  height: '2rem',
})
