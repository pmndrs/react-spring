import * as Globals from '../../animated/Globals'
import AnimatedInterpolation, {
  interpolate,
} from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import Interpolation from '../../animated/Interpolation'
import Animated from '../../animated/Animated'
import AnimatedArray from '../../animated/AnimatedArray'
import AnimatedProps from '../../animated/AnimatedProps'
import AnimatedStyle from '../../animated/AnimatedStyle'
import AnimatedValue from '../../animated/AnimatedValue'
import Controller from '../../animated/Controller'
import * as frameloop from '../../animated/Frameloop'
import * as colorMatchers from '../../shared/colorMatchers'
import * as helpers from '../../shared/helpers'
import * as constants from '../../shared/constants'
import { config } from '../../shared/constants'
import colorNames from '../../shared/colors'
import normalizeColor from '../../shared/normalizeColors'
import createInterpolation from '../../shared/interpolation'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'

export {
  Globals,
  AnimatedInterpolation,
  interpolate,
  animated,
  Interpolation,
  Animated,
  AnimatedArray,
  AnimatedProps,
  AnimatedStyle,
  AnimatedValue,
  Controller,
  frameloop,
  colorMatchers,
  helpers,
  constants,
  config,
  colorNames,
  normalizeColor,
  createInterpolation,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
