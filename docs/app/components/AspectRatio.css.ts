import { createVar, globalStyle, style } from '@vanilla-extract/css'

export const widthVar = createVar()
export const heightVar = createVar()

export const container = style({
  position: 'relative',

  '@supports': {
    '(aspect-ratio: 1)': {
      overflow: 'hidden',
      aspectRatio: `${widthVar} / ${heightVar}`,
    },

    'not (aspect-ratio: 1)': {
      ':before': {
        paddingTop: `calc((${widthVar} / ${heightVar}) * 100%)`,
        display: 'block',
        content: '',
        width: '100%',
      },
    },
  },
})

globalStyle(`${container} > *`, {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: '100%',
  maxWidth: '100%',
  minHeight: '100%',
  maxHeight: '100%',
  objectFit: 'cover',
})
