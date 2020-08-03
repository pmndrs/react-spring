import { Globals, createStringInterpolator } from '@react-spring/shared'
import { Interpolation } from './Interpolation'

// Sane defaults
Globals.assign({
  createStringInterpolator,
  to: (source, args) => new Interpolation(source, args),
})

export { Globals }

/** Advance all animations forward one frame */
export const update = () => Globals.frameLoop.advance()
