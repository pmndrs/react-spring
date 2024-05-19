import { vars } from '../../styles/theme-contract.css'
import { darkThemeClass } from '../../styles/dark-theme.css'
import { recipe } from '@vanilla-extract/recipes'
import { style } from '@vanilla-extract/css'

export const button = recipe({
  base: {
    color: vars.colors.steel100,
    border: 'none',
    borderRadius: vars.radii.r8,
    padding: 2,
    backgroundClip: 'content-box',
    position: 'relative',
    display: 'inline-block',
    zIndex: 0,

    ':before': {
      content: '',
      width: '100%',
      height: '100%',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      background: vars.colors.redYellowGradient100,
      transition: 'filter 250ms ease-out',
    },

    selectors: {
      [`${darkThemeClass} &:before`]: {
        background: vars.colors.blueGreenGradient100,
      },

      '&:hover:before': {
        filter: 'brightness(120%)',
      },

      [`.${darkThemeClass} &:hover:before`]: {
        filter: 'brightness(140%)',
      },
    },
  },

  variants: {
    size: {
      small: {
        fontSize: 12,
        fontWeight: 400,
        lineHeight: '140%',

        selectors: {
          [`${darkThemeClass} &`]: {
            fontWeight: 300,
          },
        },
      },
      regular: {
        fontSize: vars.fontSizes.XXS,
        lineHeight: vars.lineHeights.XXS,
      },
    },
  },
})

export const inner = recipe({
  base: {
    display: 'block',
    backgroundColor: vars.colors.white,
    borderRadius: 'inherit',
  },

  variants: {
    size: {
      small: {
        padding: `${vars.space['5']} ${vars.space['10']}`,
      },
      regular: {
        padding: `${vars.space['15']} ${vars.space['10']} `,
      },
    },
  },
})
