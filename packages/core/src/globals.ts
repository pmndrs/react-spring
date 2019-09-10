import { createStringInterpolator } from 'shared/stringInterpolation'
import { FrameLoop } from './FrameLoop'
import { Globals } from 'shared'
import { To } from './To'

Globals.assign({
  to: (source, args) => new To(source, args),
  frameLoop: new FrameLoop(),
  createStringInterpolator,
  applyAnimatedValues: () => false,
})

export { Globals }

/** Advance all animations forward one frame */
export const update = () => Globals.frameLoop.update()
