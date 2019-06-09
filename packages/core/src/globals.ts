import { createStringInterpolator } from 'shared/stringInterpolation'
import { FrameLoop } from './FrameLoop'
import { Globals } from 'shared'

Globals.assign({
  frameLoop: new FrameLoop(),
  createStringInterpolator,
  applyAnimatedValues: () => false,
})

export { Globals }

/** Advance all animations forward one frame */
export const update = () => Globals.frameLoop.update()
