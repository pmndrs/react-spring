import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

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
  zIndex: vars.zIndices['1'],
  mixBlendMode: 'difference',

  '@media': {
    '(hover:hover)': {
      ':hover': {
        opacity: 0,
      },
    },

    '(prefers-reduced-motion: no-preference)': {
      transition: 'opacity 250ms ease-out',
    },
  },

  [`${darkThemeClass} &`]: {
    background: 'url(/images/icons/ArrowSquareOutRed.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
})

export const exampleAnchor = style({
  textDecoration: 'none',
  zIndex: 0,
  position: 'relative',

  ':focus-visible': {
    boxShadow: 'none',
  },
})

globalStyle(`${exampleAnchor}:focus-visible ${externalLinkIcon}`, {
  opacity: 1,
  boxShadow: '0 0 0 3px $red-outline',
  outline: 'none',
  borderRadius: vars.radii.r4,
  WebkitTapHighlightColor: `3px solid ${vars.colors['red-outline']}`,
})

globalStyle(`${exampleAnchor}:hover ${externalLinkIcon}`, {
  '@media': {
    '(hover:hover)': {
      opacity: 1,
    },
  },
})

export const exampleCard = style({
  backgroundColor: vars.colors.codeBackground,
  margin: 0,
  position: 'relative',
  borderRadius: vars.radii.r8,
  overflow: 'hidden',
})

export const exampleContent = style({
  padding: vars.space['20'],
})

export const exampleDescription = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  marginBottom: vars.space['10'],
})

globalStyle(`${exampleDescription} > span + span`, {
  color: vars.colors.steel40,
})

export const exampleTags = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  gap: vars.space['10'],
  flexWrap: 'wrap',
})

export const exampleTag = style({
  selectors: {
    '&:hover::before': {
      filter: 'none !important',
    },
  },
})

globalStyle(`${exampleTag} > span`, {
  backgroundColor: vars.colors.codeBackground,
})
