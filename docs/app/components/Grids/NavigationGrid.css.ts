import { createVar, globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { recipe } from '@vanilla-extract/recipes'

export const navSection = style({
  margin: `${vars.space['20']} 0`,

  selectors: {
    '& + &': {
      marginTop: vars.space['40'],
    },
  },

  '@media': {
    [`screen and ${BREAKPOINTS.desktopUp}`]: {
      margin: `${vars.space['40']} 0`,

      selectors: {
        '& + &': {
          marginTop: vars.space['80'],
        },
      },
    },
  },
})

export const colsVar = createVar()

export const grid = recipe({
  base: {
    display: 'grid',
    gridRowGap: vars.space['20'],
    marginTop: vars.space['20'],
  },

  variants: {
    smallTiles: {
      true: {
        '@media': {
          [`screen and ${BREAKPOINTS.tabletUp}`]: {
            gridTemplateColumns: `repeat(${colsVar}, minmax(100px, 238px))`,
            gridColumnGap: vars.space['40'],
            gridRowGap: vars.space['40'],
          },
        },
      },
      false: {
        '@media': {
          [`screen and ${BREAKPOINTS.desktopUp}`]: {
            gridTemplateColumns: `repeat(${colsVar}, 1fr)`,
            gridColumnGap: vars.space['40'],
            gridRowGap: vars.space['40'],
          },
        },
      },
    },
  },
})

export const tileButton = style({})

export const backgroundTile = style({
  display: 'block',
  position: 'absolute',
  inset: 0,
  opacity: 0,
  zIndex: -1,
  background: vars.colors.redYellowGradient40,

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'opacity 250ms ease-out',
    },
  },
})

export const tile = recipe({
  base: {
    position: 'relative',
    display: 'block',
    margin: 0,
    borderRadius: vars.radii.r8,
    zIndex: 0,
    backgroundColor: vars.colors.codeBackground,
    padding: `${vars.space['15']} ${vars.space['20']}`,
    overflow: 'hidden',

    '@media': {
      '(prefers-reduced-motion: no-preference)': {
        transition: 'background-color 250ms ease-out',
      },
    },
  },

  variants: {
    small: {
      true: {
        maxWidth: '238px',
      },
    },
  },
})

export const tileCanHover = style({
  '@media': {
    '(hover:hover)': {
      ':hover': {
        backgroundColor: 'transparent',
      },
    },
  },
})

globalStyle(`${tileCanHover}:hover ${backgroundTile}`, {
  '@media': {
    '(hover:hover)': {
      opacity: 1,
    },
  },
})

globalStyle(`${tileCanHover}:hover ${tileButton}`, {
  '@media': {
    '(hover:hover)': {
      borderColor: vars.colors.red100,
    },
  },
})

export const iconWrapper = recipe({
  base: {
    display: 'block',
    marginBottom: vars.space['10'],
  },

  variants: {
    isString: {
      true: {
        fontSize: vars.fontSizes.S,
      },
    },
  },
})

export const tileCopy = style({
  marginTop: vars.space['10'],
  marginBottom: vars.space['20'],
})
