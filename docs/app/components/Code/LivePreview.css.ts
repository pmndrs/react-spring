import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { pre } from './Pre.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

export const previewContainer = style({
  width: '100%',
  margin: `${vars.space['40']} 0`,
})

globalStyle(`${previewContainer} .preview__wrapper`, {
  marginBottom: vars.space['5'],
})

globalStyle(`${previewContainer} .preview__stack`, {
  backgroundColor: 'transparent',
})

globalStyle(`${previewContainer} .preview__overlay`, {
  display: 'none',
})

globalStyle(
  `${previewContainer} .preview__layout, ${previewContainer} .preview__stack, ${previewContainer} .preview__container`,
  {
    height: '100%',
    width: '100%',
  }
)

globalStyle(`${previewContainer} .preview__container`, {
  position: 'relative',
  backgroundColor: 'transparent',
})

globalStyle(`${previewContainer} .preview__actions`, {
  position: 'absolute',
  bottom: vars.space['10'],
  right: vars.space['10'],
  display: 'flex',
  gap: vars.space['5'],
})

globalStyle(`${previewContainer} .preview__button`, {
  border: 'none',
  color: vars.colors.black,
  backgroundColor: vars.colors.codeBackground,
  cursor: 'pointer',
  margin: 0,
  padding: vars.space['5'],
  height: '3rem',
  width: '3rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: vars.radii.r8,

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'background-color 400ms',
    },
  },
})

globalStyle(`${previewContainer} .preview__button > span`, {
  display: 'none',
})

globalStyle(`${previewContainer} .preview__button:hover`, {
  '@supports': {
    '(hover: hover)': {
      backgroundColor: vars.colors.steel20,
      color: `${vars.colors.black} !important`,
    },
  },
})

globalStyle(`${darkThemeClass} ${previewContainer} .preview__button`, {
  color: vars.colors.black,
})

globalStyle(`${previewContainer} .preview__iframe`, {
  width: '100%',
  border: `solid 1px ${vars.colors.steel20}`,
  borderRadius: vars.radii.r8,
  height: 'inherit !important',
})

export const largeSize = style({})

globalStyle(`${largeSize} .preview__iframe`, {
  minHeight: 400,
})

export const isDemo = style({})

globalStyle(`${isDemo} .preview__iframe`, {
  background: vars.colors.blueGreenGradient100,
})

export const accordionRoot = style({
  borderRadius: vars.radii.r8,
  overflow: 'hidden',
})

export const accordionHeader = style({
  backgroundColor: vars.colors.codeBackground,
  padding: `${vars.space['15']} ${vars.space['30']}`,
  display: 'flex',
  justifyContent: 'flex-end',
})

export const accordionTrigger = style({
  fontFamily: vars.fonts.mono,
})

export const accordionContent = style({
  overflow: 'hidden',
})

globalStyle(`${accordionContent} ${pre}`, {
  paddingTop: '0',
  borderRadius: 'unset',
})
