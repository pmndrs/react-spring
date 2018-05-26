// This import triggers the dom specific injects
import { elements } from './animated/targets/dom/index.js'

import Animation from './animated/Animation'
import AnimatedValue from './animated/AnimatedValue'
import SpringAnimation from './animated/SpringAnimation'
import controller from './animated/AnimatedController'
import { interpolate } from './animated/AnimatedInterpolation'
import animated from './animated/createAnimatedComponent'
import Spring, { config } from './Spring'
import Transition from './Transition'
import Trail from './Trail'
import Parallax, { ParallaxLayer } from './Parallax'
import Keyframes from './Keyframes'

Object.assign(animated, elements)
const createAnimatedComponent = comp =>
  console.warn(
    'createAnimatedComponent is deprecated, use animated(comp) instead'
  ) || animated(comp)

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Parallax,
  ParallaxLayer,
  Animation,
  SpringAnimation,
  AnimatedValue,
  config,
  animated,
  controller,
  interpolate,
  // deprecated
  createAnimatedComponent,
}
