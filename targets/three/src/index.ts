import { applyProps, addEffect } from 'react-three-fiber'
import { Globals, FrameLoop } from 'core'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

Globals.assign({
  frameLoop: addEffect && new FrameLoop(),
  applyAnimatedValues: applyProps,
  createStringInterpolator,
  colorNames,
})

export * from './animated'
export * from 'core'
