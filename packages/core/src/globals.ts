import {
  Globals,
  frameLoop,
  createStringInterpolator,
} from '@react-spring/shared'
import { Interpolation } from './Interpolation'

// Sane defaults
Globals.assign({
  createStringInterpolator,
  to: (source, args) => new Interpolation(source, args),
})

export { Globals }

/** Advance all animations by the given time */
export const update = frameLoop.advance
