import * as Globals from '../../animated/Globals'
import Animation from '../../animated/Animation'
import AnimatedValue from '../../animated/AnimatedValue'
import SpringAnimation from '../../animated/SpringAnimation'
import controller from '../../animated/AnimatedController'
import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import Spring, { config } from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Keyframes from '../../Keyframes'
import Interpolation from '../web/Interpolation'
import { colorNames } from '../web/constants'

Globals.injectInterpolation(Interpolation)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => style
)

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
}
