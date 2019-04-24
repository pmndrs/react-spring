import * as THREE from 'three'
import { invalidate, applyProps, addEffect } from 'react-three-fiber'
import { interpolate } from '../../interpolate'
import animated, { withExtend } from '../../animated/createAnimatedComponent'
import * as Globals from '../../animated/Globals'
import colorNames from '../../shared/colors'
import { config } from '../../shared/constants'
import createStringInterpolator from '../../shared/stringInterpolation'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { update } from '../../animated/FrameLoop'

// Extend animated with all the available THREE elements
const threeAnimated = withExtend(animated).extend(THREE, 'primitive')

// Add the update function as a global effect to react-three-fibers update loop
if (addEffect) addEffect(update)

Globals.assign({
  colorNames,
  defaultElement: 'group',
  manualFrameloop: addEffect && invalidate,
  applyAnimatedValues: applyProps,
  createStringInterpolator,
})

/** @deprecated Use `animated.extend` instead */
export const apply = threeAnimated.extend

export { Spring, Trail, Transition } from '../../legacy'
export {
  update,
  config,
  threeAnimated as animated,
  threeAnimated as a,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
