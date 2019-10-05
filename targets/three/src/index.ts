import { invalidate, applyProps, addEffect } from 'react-three-fiber'
import { Globals, FrameLoop, update } from 'core'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

// Add the update function as a global effect to react-three-fibers update loop
if (addEffect) addEffect(update)

Globals.assign({
  defaultElement: 'group',
  frameLoop: addEffect && new FrameLoop(invalidate),
  applyAnimatedValues: applyProps,
  createStringInterpolator,
  colorNames,
})

export * from './animated'
export * from 'core'
