import './animated/targets/universal/index.js'
import * as Globals from './animated/Globals'

import Animation from './animated/Animation'
import AnimatedValue from './animated/AnimatedValue'
import SpringAnimation from './animated/SpringAnimation'
import controller from './animated/AnimatedController'
import { interpolate } from './animated/AnimatedInterpolation'
import animated from './animated/createAnimatedComponent'
import Spring, { config } from './Spring'
import Transition from './Transition'
import Trail from './Trail'
import Keyframes from './Keyframes'

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Animation,
  SpringAnimation,
  AnimatedValue,
  config,
  controller,
  interpolate,
  animated,
  Globals,
}
