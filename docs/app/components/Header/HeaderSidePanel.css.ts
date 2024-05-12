import { style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { recipe } from '@vanilla-extract/recipes'

export const mobileMenuOverlay = style({
  position: 'fixed',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  zIndex: vars.zIndices['1'],
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(5px)',

  '@supports': {
    'not (backdrop-filter: blur(10px))': {
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
  },
})

export const mobileMenu = style({
  position: 'fixed',
  right: 0,
  top: 0,
  bottom: 0,
  height: '100vh',
  width: '30rem',
  background: vars.colors.white,
  zIndex: vars.zIndices['1'],
  boxShadow: '3px 0 12px -10px rgba(0,0,0,0.5)',
  padding: `${vars.space['25']} 0 ${vars.space['10']}`,
  display: 'flex',
  flexDirection: 'column',
})

export const mobileDialogHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
})

export const mobileMenuClose = style({
  border: 'none',
  color: vars.colors.steel100,
  background: 'transparent',
  marginBottom: vars.space['20'],
  marginLeft: vars.space['15'],
  padding: '1.1rem 1.2rem',
  cursor: 'pointer',
})

export const mobileThemePicker = style({
  marginRight: vars.space['15'],
})

export const mainNavigation = recipe({
  base: {
    margin: `0 ${vars.space['10']}`,
    paddingBottom: vars.space['20'],
  },

  variants: {
    isDocsSection: {
      true: {
        borderBottom: `solid 1px ${vars.colors.steel20}`,
      },
      false: {
        flexDirection: 'column',
        alignItems: 'flex-start',
      },
    },
  },
})

export const subNavContainer = recipe({
  base: {
    listStyle: 'none',
    margin: `0 ${vars.space['10']}`,
    padding: 0,
    display: 'flex',
    gap: vars.space['10'],
    paddingTop: vars.space['10'],
  },

  variants: {
    isDocsSection: {
      true: {
        alignItems: 'center',
        borderTop: `solid 1px ${vars.colors.steel20}`,
      },
      false: {
        alignItems: 'flex-start',
        flexDirection: 'column',
      },
    },
  },
})
