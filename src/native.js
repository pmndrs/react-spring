// This import triggers the react-dom specific injects
import { elements as animated } from './animated/targets/react-native/index.js'

import Animation from './animated/Animation'
import AnimatedValue from './animated/AnimatedValue'
import SpringAnimation from './animated/SpringAnimation'
import controller from './animated/AnimatedController'
import { interpolate } from './animated/AnimatedInterpolation'
import createAnimatedComponent from './animated/createAnimatedComponent'
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
  animated,
  controller,
  interpolate,
  createAnimatedComponent,
}
