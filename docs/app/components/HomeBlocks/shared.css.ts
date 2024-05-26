import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'

export const section = style({
  padding: `0 ${vars.space['25']}`,

  selectors: {
    '& + &': {
      marginTop: vars.space['50'],
    },
  },

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      padding: `0 ${vars.space['50']}`,
      display: 'flex',
      gap: vars.space['110'],
      alignItems: 'center',

      selectors: {
        '& + &': {
          marginTop: vars.space['100'],
        },
      },
    },
  },
})

globalStyle(`${section} > *`, {
  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      flex: '1 0 calc(50% - 5.5rem)',
    },
  },
})
