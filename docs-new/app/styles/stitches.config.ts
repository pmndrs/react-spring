import { createStitches } from '@stitches/react'

const { styled, globalCss, getCssText } = createStitches({
  theme: {
    colors: {
      red: '#ff6d6d',
      steel: '#363645',
      black: '#202020',
      white: '#fff',
      grey: '#ccc',
    },
  },
  media: {
    tabletUp: '(min-width: 768px)',
    desktopUp: '(min-width: 1024px)',
    largeDesktopUp: '(min-width: 1680px)',
  },
})

export { styled, getCssText, globalCss }
