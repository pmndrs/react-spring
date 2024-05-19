import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const exampleGridRoot = style({
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridColumnGap: '20px',
  gridRowGap: '20px',
  margin: 0,
  padding: 0,
  marginBottom: vars.space['30'],
})
