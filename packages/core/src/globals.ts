import { createStringInterpolator } from 'shared/stringInterpolation'
import { Interpolation } from './Interpolation'
import { Globals } from 'shared'

// Sane defaults
Globals.assign({
  createStringInterpolator,
  to: (source, args) => new Interpolation(source, args),
})

export { Globals }

/** Advance all animations forward one frame */
export const update = () => Globals.frameLoop.update()
