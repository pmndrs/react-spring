import { globalStyle, style } from '@vanilla-extract/css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { pre } from './Pre.css'

export const preCopy = style({
  position: 'absolute',
  top: 24,
  right: 24,
  display: 'none',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      display: 'block',
    },
  },
})

globalStyle(`${pre} ${preCopy}`, {
  opacity: 0,

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'opacity 200ms ease-out',
    },
  },
})

globalStyle(`${pre}:hover ${preCopy}`, {
  opacity: 1,
})
