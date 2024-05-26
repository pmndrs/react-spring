import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const stickyMenu = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: 'inherit',
  backgroundColor: 'rgba(250, 250, 250, 0.80)',
  backdropFilter: 'blur(5px)',
  zIndex: vars.zIndices['1'],
  padding: '0 2.8rem',
  top: 0,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      padding: '0 6.2rem',
    },
  },

  selectors: {
    [`${darkThemeClass} &`]: {
      backgroundColor: 'rgba(27, 26, 34, 0.8)',
    },
  },
})

export const stickyMenuStuck = style({
  position: 'fixed',
})

globalStyle(`${stickyMenuStuck} + article`, {
  paddingTop: 82,
})
