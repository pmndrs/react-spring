import * as Stitches from '@stitches/react'

interface GradientBorderParams {
  width?: number
  gradient?: string
}

const { styled, globalCss, getCssText, config, createTheme } =
  Stitches.createStitches({
    theme: {
      colors: {
        red130: '#b34c4c',
        red120: '#cc5757',
        red110: '#e66262',
        red100: '#ff6d6d',
        red90: '#ff7c7c',
        red80: '#ff8a8a',
        red70: '#ff9999',
        red60: '#ffa7a7',
        red50: '#ffb6b6',
        red40: '#ffc5c5',
        red30: '#ffd3d3',
        red20: '#ffe2e2',
        steel120: '#2b2b37',
        steel110: '#31313e',
        steel100: '#363645',
        steel90: '#4a4a58',
        steel80: '#5e5e6a',
        steel70: '#72727d',
        steel60: '#86868f',
        steel50: '#9b9ba2',
        steel40: '#afafb5',
        steel30: '#c3c3c7',
        steel20: '#d7d7da',
        white: 'rgba(250,250,250,1)',
        white0: 'rgba(250,250,250,0)',
        black: '#1B1A22',
        green: '#1dc08f',
        grey: '$steel20',
        'red-outline': '$red40',
        buttonGradient: 'linear-gradient(330deg, #fff59a 20%, #ff6d6d 100%)',
      },
      shadows: {
        'red-outline': 'var(--colors-red-outline)',
      },
      space: {
        '10': '1rem',
        '15': '1.5rem',
        '20': '2rem',
        '25': '2.5rem',
        '30': '3rem',
        '35': '3.5rem',
        '40': '4rem',
        '45': '4.5rem',
        '50': '5rem',
        '80': '8rem',
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
        mono: '"Space Mono", monospace',
        serif: '',
      },
      fontWeights: {
        light: '200',
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
        code: '1.4rem',
      },
      lineHeights: {
        XXL: '5.8rem',
        XL: '5rem',
        L: '4.2rem',
        M: '3.6rem',
        S: '3rem',
        XS: '2.6rem',
        XXS: '2.2rem',
        code: '1.8rem',
      },
    },
    media: {
      tabletUp: '(min-width: 768px)',
      desktopUp: '(min-width: 1024px)',
      largeDesktopUp: '(min-width: 1680px)',
      dark: '(prefers-color-scheme: dark)',
      light: '(prefers-color-scheme: light)',
      motion: '(prefers-reduced-motion)',
      documentUp: '(min-width: 1200px)',
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
      debug: (value: Stitches.PropertyValue<'color'>) => ({
        border: `solid 1px ${value}`,
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

const dark = createTheme('dark', {
  colors: {
    red: '#ff6d6d',
    steel: '#ccc',
    black: '#ebebeb',
    white: 'rgba(27, 26, 34,1)',
    white0: 'rgba(27,	26, 34, 0)',
    grey: '#363645',
    green: '#1dc08f',
    'red-outline': 'rgb(29, 192, 143, 0.5)',
    buttonGradient:
      'linear-gradient(326deg, rgba(255,119,119,1) 0%, rgb(255 247 157) 5%, rgb(135 255 208) 100%)',
  },
})

type StitchesConfig = typeof config
type CSS = Stitches.CSS<StitchesConfig>
type ScaleValue<TValue> = Stitches.ScaleValue<TValue, StitchesConfig>

export type { StitchesConfig, CSS, ScaleValue }

export { styled, getCssText, globalCss, dark }
