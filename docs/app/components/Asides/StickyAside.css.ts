import { recipe } from '@vanilla-extract/recipes'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { vars } from '../../styles/theme-contract.css'

export const aside = recipe({
  base: {
    display: 'none',
    flexShrink: 1,
    width: '30rem',
    gridArea: 'aside',

    '@media': {
      [`screen and ${BREAKPOINTS.tabletUp}`]: {
        display: 'block',
        paddingTop: vars.space['25'],
        height: '100%',
      },
    },
  },
  variants: {
    isStuck: {
      true: {
        position: 'fixed',
      },
    },
  },
})
