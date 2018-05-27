import * as Globals from '../../animated/Globals'
import Animation from '../../animated/Animation'
import AnimatedValue from '../../animated/AnimatedValue'
import SpringAnimation from '../../animated/SpringAnimation'
import controller from '../../animated/AnimatedController'
import Spring, { config } from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Keyframes from '../../Keyframes'
import Interpolation from './Interpolation'

Globals.injectInterpolation(Interpolation)
Globals.injectFrame(cb => setTimeout(cb, 1), r => clearTimeout(r))
Globals.injectApplyAnimatedValues(() => false, style => style)

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
  Globals,
}
