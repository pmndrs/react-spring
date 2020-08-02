import { createStringInterpolator } from '@react-spring/shared/src/stringInterpolation'
import { Interpolation } from './Interpolation'
import { Globals } from '@react-spring/shared'

// Sane defaults
Globals.assign({
  createStringInterpolator,
  to: (source, args) => new Interpolation(source, args),
})

export { Globals }

/** Advance all animations forward one frame */
export const update = () => Globals.frameLoop.advance()
