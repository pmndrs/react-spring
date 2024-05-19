import { style } from '@vanilla-extract/css'
import { vars } from './theme-contract.css'

export const visuallyHidden = style({
  position: 'absolute',
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  wordWrap: 'normal',
})

export const inlineLink = style({
  position: 'relative',
  textDecoration: 'none',

  selectors: {
    '&:after': {
      position: 'absolute',
      bottom: -1,
      left: 0,
      content: '',
      width: '100%',
      height: 2,
      backgroundColor: vars.colors.red100,

      '@media': {
        '(prefers-reduced-motion: no-preference)': {
          transition: 'width 200ms ease-out',
        },
      },
    },

    '&:hover:after': {
      width: '0%',
    },
  },
})
