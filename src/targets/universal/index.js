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

// Render 30/fps by defaulr
Globals.injectFrame(cb => setTimeout(cb, 1000 / 30), r => clearTimeout(r))
Globals.injectInterpolation(Interpolation)
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
