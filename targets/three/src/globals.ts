import { invalidate, applyProps, addEffect } from 'react-three-fiber'
import { Globals, FrameLoop, update } from '@react-spring/core'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

// Add the update function as a global effect to react-three-fibers update loop
if (addEffect) addEffect(update)

Globals.assign({
  defaultElement: 'group',
  frameLoop: addEffect && new FrameLoop({ requestFrame: invalidate }),
  applyAnimatedValues: applyProps,
  createStringInterpolator,
  colorNames,
})

export { Globals }
