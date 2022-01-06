import * as Stitches from '@stitches/react'

interface GradientBorderParams {
  width?: number
  gradient?: string
}

const stitches = Stitches.createStitches({
  theme: {
    colors: {
      red: '#ff6d6d',
      steel: '#363645',
      black: '#1B1A22',
      white: '#fff',
      grey: '#ccc',
      'red-outline': 'rgba(255, 109, 109, 0.5)',
    },
    space: {
      '10': '1rem',
      '15': '1.5rem',
      '20': '2rem',
      '25': '2.5rem',
      '30': '3rem',
      '50': '5rem',
    },
    sizes: {
      splash: '40rem',
      type: '80rem',
      document: '120rem',
    },
    radii: {
      r4: '0.4rem',
      r8: '0.8rem',
      r20: '2rem',
      round: '50%',
    },
    zIndices: {
      1: '100',
      2: '200',
      3: '300',
      4: '400',
      max: '999',
    },
    fonts: {
      sans: 'Inter, -apple-system, system-ui, sans-serif',
      'sans-var': '"Inter var", -apple-system, system-ui, sans-serif',
      mono: '',
      serif: '',
    },
    fontWeights: {
      default: '400',
      bold: '600',
    },
    fontSizes: {
      XXL: '4.8rem',
      XL: '4rem',
      L: '3.2rem',
      M: '2.6rem',
      S: '2rem',
      XS: '1.6rem',
      XXS: '1.2rem',
    },
    lineHeights: {
      XXL: '5.8rem',
      XL: '5rem',
      L: '4.2rem',
      M: '3.6rem',
      S: '3rem',
      XS: '2.6rem',
      XXS: '2.2rem',
    },
  },
  media: {
    tabletUp: '(min-width: 768px)',
    desktopUp: '(min-width: 1024px)',
    largeDesktopUp: '(min-width: 1680px)',
    dark: '(prefers-color-scheme: dark)',
    light: '(prefers-color-scheme: light)',
    motion: '(prefers-reduced-motion)',
  },
  utils: {
    p: (value: Stitches.PropertyValue<'padding'>) => ({
      padding: value,
    }),
    pt: (value: Stitches.PropertyValue<'paddingTop'>) => ({
      paddingTop: value,
    }),
    pr: (value: Stitches.PropertyValue<'paddingRight'>) => ({
      paddingRight: value,
    }),
    pb: (value: Stitches.PropertyValue<'paddingBottom'>) => ({
      paddingBottom: value,
    }),
    pl: (value: Stitches.PropertyValue<'paddingLeft'>) => ({
      paddingLeft: value,
    }),
    px: (value: Stitches.PropertyValue<'paddingLeft'>) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    py: (value: Stitches.PropertyValue<'paddingTop'>) => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    m: (value: Stitches.PropertyValue<'margin'>) => ({
      margin: value,
    }),
    mt: (value: Stitches.PropertyValue<'marginTop'>) => ({
      marginTop: value,
    }),
    mr: (value: Stitches.PropertyValue<'marginRight'>) => ({
      marginRight: value,
    }),
    mb: (value: Stitches.PropertyValue<'marginBottom'>) => ({
      marginBottom: value,
    }),
    ml: (value: Stitches.PropertyValue<'marginLeft'>) => ({
      marginLeft: value,
    }),
    mx: (value: Stitches.PropertyValue<'marginLeft'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
    my: (value: Stitches.PropertyValue<'marginTop'>) => ({
      marginTop: value,
      marginBottom: value,
    }),
    // require unused variable to allow custom CSS type to be used
    visuallyHidden: (_val: string) => ({
      position: 'absolute',
      border: 0,
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      wordWrap: 'normal',
    }),
    gradientBorder: ({ width = 1, gradient = '' }: GradientBorderParams) => ({
      position: 'relative',

      '&::before': {
        content: `''`,
        display: 'block',
        backgroundImage: gradient,
        position: 'absolute',
        top: `-${width}px`,
        left: `-${width}px`,
        width: `calc(100% + ${width * 2}px)`,
        height: `calc(100% + ${width * 2}px)`,
        borderRadius: 'inherit',
        zIndex: -1,
      },
    }),
  },
})

const { styled, globalCss, getCssText, config } = stitches

type StitchesConfig = typeof config
type CSS = Stitches.CSS<StitchesConfig>
type ScaleValue<TValue> = Stitches.ScaleValue<TValue, StitchesConfig>

export type { StitchesConfig, CSS, ScaleValue }

export { styled, getCssText, globalCss }
