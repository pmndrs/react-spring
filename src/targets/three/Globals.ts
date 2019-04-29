import { invalidate, applyProps, addEffect } from 'react-three-fiber'
import { createStringInterpolator } from '../../shared/stringInterpolation'
import { Globals } from '../../animated'
import { update } from '../../animated/FrameLoop'
import colorNames from '../../shared/colors'

// Add the update function as a global effect to react-three-fibers update loop
if (addEffect) addEffect(update)

Globals.assign({
  defaultElement: 'group',
  manualFrameloop: addEffect && invalidate,
  applyAnimatedValues: applyProps,
  createStringInterpolator,
  colorNames,
})

export { Globals }
