import { styled } from '~/styles/stitches.config'

/**
 * Credit to https://ped.ro/writing/code-blocks-but-better
 */
export const Pre = styled('pre', {
  $$comment: '#a6accd',
  $$punctuation: '#e4f0fb',
  $$property: '#e4f0fb',
  $$boolean: '#f087bd',
  $$string: '#5de4c7',
  $$operator: '#add7ff',
  $$function: '#5de4c7',
  $$keyword: '#add7ff',
  $$literal: '#fffac2',
  $$falsy: '#f087bd',

  boxSizing: 'border-box',
  padding: '$30',
  borderRadius: '$r8',
  overflow: 'auto',
  fontFamily: '$mono',
  fontSize: '$code',
  lineHeight: '$code',
  whiteSpace: 'pre',
  backgroundColor: '#161616',
  color: '#fafafa',

  '& > code': { display: 'block', fontFamily: 'inherit' },

  '.token.namespace': {
    opacity: 0.7,
  },

  '.token.script': {
    color: '$$property',
  },

  '.token.comment, .token.prolog, .token.doctype, .token.cdata': {
    color: '$$comment',
  },

  '.token.punctuation': {
    color: '$$punctuation',
  },

  '.token.function, .token.property, .token.constant, .token.symbol, .token.deleted':
    {
      color: '$$property',
    },

  '.token.boolean, .token.number': {
    color: '$$boolean',
  },

  '.token.tag, .token.selector, .token.attr-value, .token.string, .token.char, .token.builtin, .token.inserted':
    {
      color: '$$string',
    },

  '.token.attr-name, .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string, .token.variable':
    {
      color: '$$operator',
    },

  '.token.atrule, .token.class-name': {
    color: '$$function',
  },

  '.token.keyword': {
    color: '$$keyword',
  },

  '.token.regex, .token.important': {
    color: '$$literal',
  },

  '.token.deleted': {
    color: '$$falsy',
  },

  '.token.important, .token.bold': {
    fontWeight: 'bold',
  },

  '.token.italic': {
    fontStyle: 'italic',
  },

  '.highlight-line[data-highlighted="false"], .highlight-line[data-highlighted="false"] *':
    {
      color: '$$comment',
      opacity: 0.8,
    },

  '.highlight-word': {
    display: 'inline-block',
    color: 'rgba(29, 192, 143, 0.9)',
    backgroundColor: 'rgba(29, 192, 143, 0.25)',
    borderRadius: '$r4',
    py: 2,
    px: 5,
    transition: 'color 400ms, background-color 400ms, transform 400ms',
  },

  '.highlight-word.on': {
    color: 'rgba(29, 192, 143, 1)',
    backgroundColor: 'rgba(29, 192, 143, 0.4)',
    transform: 'scale(1.1)',
  },

  variants: {
    showLineNumbers: {
      true: {
        '.highlight-line': {
          position: 'relative',
          paddingLeft: '$30',

          '&::before': {
            content: 'attr(data-line)',
            position: 'absolute',
            left: -5,
            top: 0,
            color: '$$comment',
            opacity: 0.5,
          },
        },
        '&[data-showing-lines="true"] .highlight-line[data-highlighted="true"]':
          {
            '&:before': {
              opacity: 1,
            },
          },
      },
    },
  },
})
