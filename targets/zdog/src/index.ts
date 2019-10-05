import { Anchor, invalidate, applyProps, addEffect } from 'react-zdog'
import { Globals, FrameLoop, update } from 'core'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

// Add the update function as a global effect to react-zdog's update loop
if (addEffect) addEffect(update)

Globals.assign({
  defaultElement: Anchor,
  frameLoop: addEffect && new FrameLoop(invalidate),
  applyAnimatedValues: applyProps,
  createStringInterpolator,
  colorNames,
})

export * from './animated'
export * from 'core'
