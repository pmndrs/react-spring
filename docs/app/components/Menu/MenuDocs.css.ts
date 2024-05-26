import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { XS } from '../../styles/fontStyles.css'

export const docsList = style({
  margin: 0,
  padding: `${vars.space['15']} ${vars.space['10']}`,
  listStyle: 'none',
  overflowY: 'auto',
  flexShrink: 1,
  flexGrow: 1,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      overflowY: 'unset',
      height: '100%',
      padding: '0.4rem',
      paddingLeft: vars.space['50'],
      paddingRight: vars.space['25'],
      marginTop: '-0.4rem',
    },
  },
})

globalStyle(`${docsList} ul`, {
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

export const scrollArea = style({
  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      maxHeight: '100%',
      overflowY: 'scroll',
      paddingBottom: vars.space['60'],
    },
  },
})

export const anchorStyles = style([
  XS,
  {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    padding: '0.5rem 1.2rem',
    borderRadius: vars.radii.r8,
    fontWeight: vars.fontWeights.default,
    paddingLeft: vars.space['20'],

    '@media': {
      '(hover: hover)': {
        ':hover': {
          backgroundColor: '#ff6d6d33',
        },
      },
    },
  },
])

export const anchorTitle = style({
  fontWeight: vars.fontWeights.bold,
  paddingLeft: '1.2rem',
})

export const anchorHasNoLink = style({
  '@media': {
    '(hover: hover)': {
      ':hover': {
        backgroundColor: 'transparent',
      },
    },
  },
})

export const anchorActive = style({
  backgroundColor: '#ff6d6d99',

  '@media': {
    '(hover: hover)': {
      ':hover': {
        backgroundColor: '#ff6d6d99',
      },
    },
  },
})

export const widgetContainer = style({})

globalStyle(`${widgetContainer} .DocSearch`, {
  fontSize: vars.fontSizes.XS,
  color: vars.colors.steel40,
})

globalStyle(
  `${widgetContainer} .DocSearch-Container, ${widgetContainer} .DocSearch-Container *`,
  {
    pointerEvents: 'auto',
  }
)

globalStyle(`${widgetContainer} .DocSearch-Button`, {
  borderRadius: vars.radii.r8,
  margin: 0,
  padding: `${vars.space['5']} 11px`,
  width: '100%',
  marginBottom: vars.space['10'],
  backgroundColor: 'transparent',
  border: `1px solid ${vars.colors.steel40}`,
  alignItems: 'center',
  transition: 'border-color 200ms ease-out',
})

globalStyle(`${widgetContainer} .DocSearch-Button:hover`, {
  '@media': {
    '(hover: hover)': {
      background: 'transparent',
      boxShadow: 'unset',
      borderColor: vars.colors.red100,
    },
  },
})

globalStyle(`${widgetContainer} .DocSearch-Button-Keys`, {
  justifyContent: 'flex-end',
})

globalStyle(`${widgetContainer} .DocSearch-Button-Placeholder`, {
  fontSize: vars.fontSizes.XS,
  padding: 0,
  display: 'unset',
})

globalStyle(`${widgetContainer} .DocSearch-Search-Icon`, {
  display: 'none',
})

globalStyle(`${widgetContainer} .DocSearch-Button-Key`, {
  border: 'none',
  background: 'transparent',
  boxShadow: 'unset',
  width: 'unset',
  height: 'unset',
  padding: 0,
  margin: 0,
  color: vars.colors.steel60,
  fontFamily: vars.fonts['sans-var'],
})
