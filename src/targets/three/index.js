import * as THREE from 'three/src/Three'
import { applyProps } from 'react-three-fiber'
import { interpolate } from '../../animated/AnimatedInterpolation'
import Interpolation, {
  InterpolationConfig,
} from '../../animated/Interpolation'
import AnimatedStyle from '../../animated/AnimatedStyle'
import animated from '../../animated/createAnimatedComponent'
import * as Globals from '../../animated/Globals'
import colorNames from '../../shared/colors'
import { config } from '../../shared/constants'
import createInterpolation from '../../shared/interpolation'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { merge } from '../../shared/helpers'

// Extend animated with all the available THREE elements
const apply = merge(animated)
const extendedAnimated = apply(THREE)

//Globals.injectManualFrameloop(true)
//useFrameloop(frameloop.update)
// Set default native-element
Globals.injectDefaultElement('group')
// Use default interpolation (which includes numbers, strings, colors)
Globals.injectInterpolation(createInterpolation)
// Inject color names, so that it will be able to deal with things like "peachpuff"
Globals.injectColorNames(colorNames)
// This is how we teach react-spring to set props "natively", the api is (instance, props) => { ... }
Globals.injectApplyAnimatedValues(applyProps)

export {
  apply,
  config,
  extendedAnimated as animated,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
  Interpolation,
}
