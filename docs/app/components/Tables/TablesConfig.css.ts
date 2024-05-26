import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'

export const table = style({
  width: '100%',
  textAlign: 'left',
  borderCollapse: 'collapse',
})

globalStyle(`${table} td, ${table} th`, {
  borderBottom: `2px solid ${vars.colors.codeBackground}`,
})

export const tableHeadCell = style({
  fontFamily: vars.fonts['sans-var'],
  fontSize: vars.fontSizes.XXS,
  lineHeight: vars.lineHeights.XXS,
  padding: `${vars.space['15']} 0`,
})

export const firstTableCell = style({
  width: '40%',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      width: '30%',
    },
  },
})

export const secondTableCell = style({
  width: '60%',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      width: '50%',
    },
  },
})

export const thirdTableCell = style({
  display: 'none',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'table-cell',
      width: '20%',
    },
  },
})
