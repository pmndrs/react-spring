import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'

export const list = style({
  paddingLeft: vars.space['20'],
  fontWeight: vars.fontWeights.default,
})

globalStyle(`${list} code`, {
  backgroundColor: vars.colors.steel20,
  borderRadius: vars.radii.r4,
  padding: '0.2rem 0.5rem',
})

export const descriptiveList = style({})

globalStyle(`${descriptiveList} code`, {
  backgroundColor: vars.colors.steel20,
  borderRadius: vars.radii.r4,
  padding: '0.2rem 0.5rem',
})

globalStyle(`${descriptiveList} div`, {
  display: 'flex',
  gap: vars.space['5'],
})

globalStyle(`${descriptiveList} dt`, {
  display: 'flex',
  gap: vars.space['5'],
})

globalStyle(`${descriptiveList} dd`, {
  display: 'flex',
  gap: vars.space['5'],
})
