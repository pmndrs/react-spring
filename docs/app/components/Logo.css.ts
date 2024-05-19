import { recipe } from '@vanilla-extract/recipes'
import { BREAKPOINTS } from '../styles/breakpoints.css'

export const svg = recipe({
  base: {
    touchAction: 'none',
  },

  variants: {
    large: {
      false: {
        width: '48px',
        height: '48px',

        '@media': {
          [`screen and ${BREAKPOINTS.tabletUp}`]: {
            height: '64px',
            width: '64px',
          },
        },
      },
      true: {
        width: '100%',
      },
    },
  },
})
