import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { BREAKPOINTS } from '../../styles/breakpoints.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const header = style({
  position: 'relative',
  zIndex: 0,
})

export const titleTop = style({
  position: 'absolute',
  height: '100vh',
  width: '100vw',
  top: 0,
  left: 0,
  zIndex: vars.zIndices['1'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      minHeight: 'unset',
    },
  },
})

export const titleContent = style({
  maxWidth: vars.sizes.type,
  padding: `${vars.space['100']} ${vars.space['25']} 0 ${vars.space['25']}`,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      padding: `calc((175 / 1440) * 100%) ${vars.space['50']} 0 ${vars.space['50']}`,
    },
  },
})

export const arrowCircleRight = style({
  color: vars.colors.steel100,
})

export const topFields = style({
  display: 'flex',
  marginTop: vars.space['40'],
  flexDirection: 'column',
  alignItems: 'flex-start',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      flexDirection: 'row',
      gap: vars.space['20'],
    },
  },
})

export const navLink = style({
  marginTop: vars.space['20'],

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: 0,
    },
  },
})

globalStyle(`${navLink} > span`, {
  marginRight: 12,
})

export const titleBottom = style({
  position: 'absolute',
  height: '100vh',
  width: '100vw',
  bottom: 0,
  left: 0,
  padding: `0 ${vars.space['25']}`,
  zIndex: vars.zIndices['1'],
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      minHeight: 'unset',
      padding: `0 ${vars.space['50']}`,
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
})

export const left = style({
  maxWidth: 630,
})

export const leftCopy = style({
  marginTop: vars.space['25'],
  whiteSpace: 'pre-line',
})

export const right = style({
  display: 'flex',
  alignItems: 'flex-end',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      maxWidth: 630,
      paddingBottom: 192,
    },
  },
})

export const background = style({
  position: 'relative',
  width: '100%',
  zIndex: 0,
})

export const ballContainer = style({
  width: '100vw',
  height: '100vh',
  position: 'relative',
})

export const redBall = style({
  width: 'min(1440px, 100%)',
  position: 'absolute',
  aspectRatio: `1`,
  top: 'max(-720px, -50vw)',
  right: 'max(-720px, -50vw)',
  borderRadius: '50%',
  backgroundColor: '#fafafa',
  filter: 'blur(4px)',
  boxShadow: `inset 0 0 100px -30px #fafafa, inset 0px 0px 30vw 30vw rgb(255 109 109), 0 0 120px 80px rgb(255 109 109)`,

  '@media': {
    [`screen and ${BREAKPOINTS.desktopUp}`]: {
      boxShadow: `inset 0 0 100px -30px #fafafa, inset 0px 0px 40vw 40vw rgb(255 109 109), 0 0 120px 80px rgb(255 109 109)`,
    },
  },

  selectors: {
    [`${darkThemeClass} &`]: {
      boxShadow: `inset 0 0 100px -40px #fafafa, inset 0px 0px 30vw 30vw rgb(255 109 109), 0 0 70px 40px rgb(255 109 109)`,

      '@media': {
        [`screen and ${BREAKPOINTS.desktopUp}`]: {
          boxShadow: `inset 0 0 100px -40px #fafafa, inset 0px 0px 40vw 40vw rgb(255 109 109), 0 0 70px 40px rgb(255 109 109)`,
        },
      },
    },
  },
})

export const orangeBallContainer = style({
  marginTop: '-70vh',
})

export const orangeBall = style({
  aspectRatio: `1`,
  width: 'max(240px, 20vw)',
  position: 'absolute',
  left: 'min(-125px, -10vw)',
  top: '40vh',
  borderRadius: '50%',
  backgroundColor: '#fafafa',
  filter: 'blur(4px)',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      top: '28vh',
    },
  },

  boxShadow: `inset 0 0 100px -30px #fafafa, inset 0px 0px max(60px, 6vw) max(60px, 6vw) #FFB74B, 0 0 120px 80px #FFB74B`,

  selectors: {
    [`${darkThemeClass} &`]: {
      boxShadow: `inset 0 0 100px -40px #fafafa, inset 0px 0px max(60px, 6vw) max(60px, 6vw) #FFB74B, 0 0 70px 40px #FFB74B`,
    },
  },
})

export const greenBallContainer = style({
  marginTop: '-50vh',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: '-70vh',
    },
  },
})

export const greenBall = style({
  aspectRatio: `1`,
  position: 'absolute',
  width: 'min(576px, 40vw)',
  borderRadius: '50%',
  backgroundColor: '#fafafa',
  filter: 'blur(4px)',
  right: '20vw',
  bottom: 0,
  opacity: 0.6,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      opacity: 1,
      bottom: '10vh',
      right: '10vw',
    },
  },

  boxShadow: `inset 0 0 100px -30px #fafafa, inset 0px 0px max(70px, 12vw) max(70px, 12vw) #88DFAB, 0 0 120px 80px #88DFAB`,

  selectors: {
    [`${darkThemeClass} &`]: {
      boxShadow: `inset 0 0 100px -40px #fafafa, inset 0px 0px max(70px, 12vw) max(70px, 12vw) #88DFAB, 0 0 70px 40px #88DFAB`,
    },
  },
})

export const blueBallContainer = style({
  marginTop: '-50vh',
  marginBottom: '10vh',

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      marginTop: '-70vh',
    },
  },
})

export const blueBall = style({
  aspectRatio: `1`,
  position: 'absolute',
  borderRadius: '50%',
  backgroundColor: '#fafafa',
  filter: 'blur(4px)',
  width: 'min(430px, 30vw)',
  bottom: 40,
  left: 100,
  opacity: 0.6,

  '@media': {
    [`screen and ${BREAKPOINTS.tabletUp}`]: {
      opacity: 1,
    },
  },

  boxShadow: `inset 0 0 100px -30px #fafafa, inset 0px 0px max(70px, 8vw) max(70px, 8vw) #569AFFB3, 0 0 120px 80px #569AFFB3`,

  selectors: {
    [`${darkThemeClass} &`]: {
      boxShadow: `inset 0 0 100px -40px #fafafa, inset 0px 0px max(70px, 8vw) max(70px, 8vw) #569AFF, 0 0 70px 40px #569AFF`,
    },
  },
})

export const carbonBanner = style({})

globalStyle(`${carbonBanner} > #carbonads`, {
  margin: 0,
  marginTop: vars.space['60'],
})
