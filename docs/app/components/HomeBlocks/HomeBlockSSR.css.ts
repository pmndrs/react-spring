import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'

export const ssrSection = style({})

globalStyle(`${ssrSection} > *`, {
  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      flex: '1 1',
    },
  },
})

export const sizeGraph = style({
  position: 'relative',
  border: `1px solid ${vars.colors.steel20}`,
  borderRadius: vars.radii.r4,
  padding: `${vars.space['30']} ${vars.space['40']} ${vars.space['40']}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: `clamp(${vars.space['10']}, 10%, ${vars.space['40']})`,
  aspectRatio: `570 / 380`,
  marginTop: vars.space['20'],
})

export const graphBar = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  width: 'calc((100% - 80rem) / 3)',
  flex: '1 1 calc((100% - 80rem) / 3)',
})

globalStyle(`${graphBar} > h4`, {
  fontSize: '1.2rem',
  fontWeight: 700,
  lineHeight: '180%',
  textAlign: 'center',
  color: vars.colors.black,
})

globalStyle(`${graphBar} > h5`, {
  fontSize: '1.4rem',
  fontWeight: vars.fontWeights.default,
  lineHeight: '180%',
  textAlign: 'center',
  color: vars.colors.black,
  whiteSpace: 'nowrap',
  display: 'flex',
  justifyContent: 'space-evenly',
})

export const bar = style({
  width: '100%',
  background: vars.colors.redYellowGradient100,
  height: 1,
  marginBottom: 4,
  marginTop: 2,
  borderRadius: vars.radii.r4,
})
