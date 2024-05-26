import { style } from '@vanilla-extract/css'
import { BREAKPOINTS } from './breakpoints.css'
import { vars } from './theme-contract.css'

export type FontSizes = typeof vars.fontSizes
export type FontWeights = typeof vars.fontWeights

export const XXL = style({
  fontSize: vars.fontSizes.XL,
  lineHeight: vars.lineHeights.XL,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.XXL,
      lineHeight: vars.lineHeights.XXL,
    },
  },
})

export const XL = style({
  fontSize: vars.fontSizes.L,
  lineHeight: vars.lineHeights.L,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.XL,
      lineHeight: vars.lineHeights.XL,
    },
  },
})

export const L = style({
  fontSize: vars.fontSizes.M,
  lineHeight: vars.lineHeights.M,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.L,
      lineHeight: vars.lineHeights.L,
    },
  },
})

export const M = style({
  fontSize: vars.fontSizes.S,
  lineHeight: vars.lineHeights.S,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.M,
      lineHeight: vars.lineHeights.M,
    },
  },
})

export const S = style({
  fontSize: vars.fontSizes.XS,
  lineHeight: vars.lineHeights.XS,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.S,
      lineHeight: vars.lineHeights.S,
    },
  },
})

export const XS = style({
  fontSize: vars.fontSizes.XXS,
  lineHeight: vars.lineHeights.XXS,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      fontSize: vars.fontSizes.XS,
      lineHeight: vars.lineHeights.XS,
    },
  },
})

export const XXS = style({
  fontSize: vars.fontSizes.XXS,
  lineHeight: vars.lineHeights.XXS,
})

export const code = style({
  fontSize: vars.fontSizes.code,
  lineHeight: vars.lineHeights.code,
})

export const WEIGHTS = {
  default: style({
    fontWeight: vars.fontWeights.default,
  }),
  bold: style({
    fontWeight: vars.fontWeights.bold,
  }),
  semiblack: style({
    fontWeight: vars.fontWeights.semiblack,
  }),
}
