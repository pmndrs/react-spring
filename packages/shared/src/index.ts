import * as Globals from './globals'
export { Globals }

import { FrameLoop } from './FrameLoop'
Globals.assign({
  frameLoop: new FrameLoop(),
})

export * from './FrameLoop'
export * from './hooks'
export * from './colors'
export * from './colorToRgba'
export * from './colorMatchers'
export * from './createInterpolator'
export * from './stringInterpolation'
export * from './deprecations'
export * from './helpers'

export * from 'fluids'
