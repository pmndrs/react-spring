import * as Globals from 'shared/globals'

// ts-jest emits CommonJS so we can't use "live bindings"
export const to = (...args: [any, any]) =>
  Globals.createAnimatedInterpolation(...args)

export { to as interpolate }
