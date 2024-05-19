import { globalStyle } from '@vanilla-extract/css'
import { vars } from '../styles/theme-contract.css'
import { recipe } from '@vanilla-extract/recipes'

export const calloutWrapper = recipe({
  base: {
    borderRadius: vars.radii.r8,
    padding: vars.space['30'],
    margin: `${vars.space['20']} 0`,
  },

  variants: {
    type: {
      warning: {
        backgroundColor: '#FF701933',
      },
      danger: {
        backgroundColor: 'red',
      },
      success: {
        backgroundColor: 'green',
      },
      note: {
        background: '#569AFF33',
      },
    },
  },
})

globalStyle(`${calloutWrapper} + pre`, {
  marginTop: vars.space['40'],
})

export const label = recipe({
  base: {
    fontWeight: vars.fontWeights.semiblack,
    marginBottom: vars.space['15'],
    display: 'flex',
    gap: vars.space['5'],
    alignItems: 'center',
  },

  variants: {
    type: {
      warning: {
        color: '#FF7019CC',
      },
      danger: {
        color: '#FF7019CC',
      },
      success: {
        color: '#FF7019CC',
      },
      note: {
        color: '#569AFF',
      },
    },
  },
})
