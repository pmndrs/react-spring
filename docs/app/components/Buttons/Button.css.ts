import { recipe } from '@vanilla-extract/recipes'
import { vars } from '../../styles/theme-contract.css'

export const sharedStyles = recipe({
  base: {
    border: `solid 1px ${vars.colors.black}`,
    backgroundColor: 'transparent',
    borderRadius: vars.radii.r4,
    fontFamily: vars.fonts.sans,
    fontSize: vars.fontSizes.XXS,
    lineHeight: vars.lineHeights.code,
    padding: `${vars.space['5']} ${vars.space['10']}`,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',

    '@media': {
      '(prefers-reduced-motion: no-preference)': {
        transition: 'border-color 200ms ease-out',
      },

      '(hover:hover)': {
        ':hover': {
          borderColor: vars.colors.red100,
        },
      },
    },

    ':disabled': {
      pointerEvents: 'none',
      opacity: 0.5,
    },
  },

  variants: {
    variant: {
      regular: {},
      large: {
        padding: '11px 9px 11px 12px',
        borderRadius: vars.radii.r8,
      },
    },
  },
})
