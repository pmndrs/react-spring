import { createVar, globalStyle, style } from '@vanilla-extract/css'
import { vars } from '../../styles/theme-contract.css'
import { darkThemeClass } from '../../styles/dark-theme.css'

const comment = createVar()
const punctuation = createVar()
const property = createVar()
const boolean = createVar()
const string = createVar()
const operator = createVar()
const _function = createVar()
const keyword = createVar()
const literal = createVar()
const falsy = createVar()

/**
 * Credit to https://ped.ro/writing/code-blocks-but-better
 */
export const pre = style({
  vars: {
    [comment]: vars.colors.steel60,
    [punctuation]: vars.colors.steel80,
    [property]: vars.colors.steel100,
    [boolean]: '#e52e8d',
    [string]: '#189076',
    [operator]: '#0074e0',
    [_function]: '#189076',
    [keyword]: '#0074e0',
    [literal]: '#fffac2',
    [falsy]: '#e52e8d',
  },

  position: 'relative',
  backgroundColor: vars.colors.codeBackground,
  color: vars.colors.black,
  margin: 0,
  overflow: 'hidden',

  selectors: {
    [`${darkThemeClass} &`]: {
      vars: {
        [comment]: '#a6accd',
        [punctuation]: '#e4f0fb',
        [property]: '#e4f0fb',
        [boolean]: '#f087bd',
        [string]: '#5de4c7',
        [operator]: '#add7ff',
        [_function]: '#5de4c7',
        [keyword]: '#add7ff',
        [literal]: '#fffac2',
        [falsy]: '#f087bd',
      },
    },
  },

  boxSizing: 'border-box',
  borderRadius: vars.radii.r8,
  fontFamily: vars.fonts.mono,
  fontSize: vars.fontSizes.code,
  lineHeight: vars.lineHeights.code,
  whiteSpace: 'pre',
  overflowX: 'auto',
  overflowY: 'hidden',
  padding: vars.space['30'],
})

export const showLineNumbers = style({})

globalStyle(`${showLineNumbers} .highlight-line`, {
  position: 'relative',
  paddingLeft: vars.space['30'],
})

globalStyle(`${showLineNumbers} .highlight-line::before`, {
  content: 'attr(data-line)',
  position: 'absolute',
  left: -5,
  top: 0,
  color: comment,
  opacity: 0.5,
})

globalStyle(
  `${showLineNumbers}[data-highlighted="true"] .highlight-line[data-highlighted="true"]::before`,
  {
    opacity: 1,
  }
)

globalStyle(`${pre} > code`, {
  fontFamily: 'inherit',
  display: 'inline-block',
  position: 'relative',
})

globalStyle(`${pre} > code::before`, {
  content: '',
  display: 'block',
  position: 'absolute',
  right: -30,
  width: 30,
  height: 1,
})

globalStyle('.token.namespace', {
  opacity: 0.7,
})

globalStyle('.token.script', {
  color: property,
})

globalStyle('.token.comment, .token.prolog, .token.doctype, .token.cdata', {
  color: comment,
})

globalStyle('.token.punctuation', {
  color: punctuation,
})

globalStyle(
  '.token.function, .token.property, .token.constant, .token.symbol, .token.deleted',
  {
    color: property,
  }
)

globalStyle('.token.boolean, .token.number', {
  color: boolean,
})

globalStyle(
  '.token.tag, .token.selector, .token.attr-value, .token.string, .token.char, .token.builtin, .token.inserted',
  {
    color: string,
  }
)

globalStyle(
  '.token.attr-name, .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string, .token.variable',
  {
    color: operator,
  }
)

globalStyle('.token.atrule, .token.class-name', {
  color: _function,
})

globalStyle('.token.keyword', {
  color: keyword,
})

globalStyle('.token.regex, .token.important', {
  color: literal,
})

globalStyle('.token.important, .token.bold', {
  fontWeight: 'bold',
})

globalStyle('.token.italic', {
  fontStyle: 'italic',
})

globalStyle('.token.deleted', {
  color: falsy,
})

globalStyle(
  '.highlight-line[data-highlighted="false"], .highlight-line[data-highlighted="false"] *',
  {
    color: comment,
    opacity: 0.8,
  }
)

/**
 * TODO: add color changes
 */
globalStyle('.highlight-word', {
  display: 'inline-block',
  borderRadius: vars.radii.r4,
  padding: '0.2rem 0.5rem',

  '@media': {
    '(prefers-reduced-motion: no-preference)': {
      transition: 'color 400ms, background-color 400ms, transform 400ms',
    },
  },
})

/**
 * TODO: add color changes
 */
globalStyle('.highlight-word.on', {
  transform: 'scale(1.1)',
})
