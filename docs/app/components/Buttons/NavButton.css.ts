import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { XXS } from '../../styles/fontStyles.css'
import { recipe } from '@vanilla-extract/recipes'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const navIconWrapper = recipe({
  base: {
    position: 'relative',
    zIndex: vars.zIndices['2'],
    display: 'flex',
    alignItems: 'center',
    margin: vars.space['15'],
  },

  variants: {
    isRoute: {
      true: {
        color: vars.colors.steel100,

        selectors: {
          [`${darkThemeClass} &`]: {
            color: '#363645',
          },
        },
      },
    },
  },
})

export const navIconLabel = style([
  XXS,
  {
    fontWeight: vars.fontWeights.bold,
    marginLeft: vars.space['15'],
  },
])

export const navAnchor = recipe({
  base: {
    height: '4.6rem',
    width: '4.6rem',
    color: vars.colors.steel100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: vars.radii.r4,
    padding: 2,
    backgroundClip: 'content-box',

    ':before': {
      content: '',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      opacity: 0,
      background: vars.colors.redYellowGradient100,
    },

    '@media': {
      '(prefers-reduced-motion: no-preference)': {
        ':before': {
          transition: 'opacity 250ms ease-out',
        },
      },
    },
  },

  variants: {
    active: {
      true: {
        background: vars.colors.redYellowGradient100,
      },
      false: {
        backgroundColor: '$white',

        '@media': {
          '(hover: hover)': {
            selectors: {
              '&:hover:before': {
                opacity: 1,
              },
            },
          },
        },
      },
    },
    variant: {
      withLabel: {
        width: '100%',
        justifyContent: 'flex-start',
      },
    },
  },
})
