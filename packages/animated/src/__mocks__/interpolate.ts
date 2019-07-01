import * as Globals from 'shared/globals'

// ts-jest emits CommonJS so we can't use "live bindings"
export const interpolate = (...args: [any, any]) =>
  Globals.createAnimatedInterpolation(...args)
