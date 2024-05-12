import { recipe } from '@vanilla-extract/recipes'

export const svg = recipe({
  base: {
    touchAction: 'none',
  },

  variants: {
    large: {
      false: {
        width: '48px',
        height: '48px',

        '@tabletUp': {
          height: '64px',
          width: '64px',
        },
      },
      true: {
        width: '100%',
      },
    },
  },
})
