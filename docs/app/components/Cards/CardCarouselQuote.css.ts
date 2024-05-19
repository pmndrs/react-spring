import { globalStyle, style } from '@vanilla-extract/css'
import { darkThemeClass } from '../../styles/dark-theme.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { vars } from '../../styles/theme-contract.css'

export const externalLinkIcon = style({
  position: 'absolute',
  top: 16,
  right: 20,
  height: 24,
  width: 24,
  background: 'url(/images/icons/ArrowSquareOutBlue.png)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  backgroundPosition: 'center',

  '@media': {
    '(hover:hover)': {
      opacity: 0,
    },

    '(prefers-reduced-motion: no-preference)': {
      transition: 'opacity 250ms ease-out',
    },
  },

  selectors: {
    [`${darkThemeClass} &`]: {
      background: 'url(/images/icons/ArrowSquareOutRed.png)',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  },
})

export const quoteAnchor = style({
  flex: '1 0 80vw',
  textDecoration: 'none',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      flex: '1 0 388px',
    },
  },
})

globalStyle(`${quoteAnchor}:hover ${externalLinkIcon}`, {
  '@media': {
    '(hover:hover)': {
      opacity: 1,
    },
  },
})

export const quoteCard = style({
  backgroundColor: vars.colors.codeBackground,
  margin: 0,
  padding: vars.space['20'],
  borderRadius: vars.radii.r8,
  position: 'relative',
})

export const quoteImage = style({
  borderRadius: '50%',
  width: '4.8rem',
  marginRight: vars.space['10'],
})

export const quoteeHandle = style({
  marginBottom: vars.space['10'],
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
})

export const quoteeName = style({})

globalStyle(`${quoteeName} > span`, {
  color: vars.colors.steel60,
})
