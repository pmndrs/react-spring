import { globalStyle, style } from '@vanilla-extract/css'

export const linkIcon = style({
  position: 'absolute',
  left: -24,
  bottom: 2,
  transform: 'translateY(-50%)',
  opacity: 0,

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'opacity 200ms ease-out',
    },
  },
})

export const heading = style({
  whiteSpace: 'pre-line',
  position: 'relative',
})

globalStyle(`${heading} > a`, {
  pointerEvents: 'auto',
  textDecoration: 'none',
  fontWeight: 'inherit',
})

globalStyle(`${heading}:hover > a + ${linkIcon}`, {
  opacity: 1,
})
