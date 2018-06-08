import * as Globals from '../../animated/Globals'
import Animation from '../../animated/Animation'
import AnimatedValue from '../../animated/AnimatedValue'
import SpringAnimation from '../../animated/SpringAnimation'
import controller from '../../animated/AnimatedController'
import Interpolation from '../../animated/Interpolation'
import animated from '../../animated/createAnimatedComponent'
import createInterpolation from '../shared/interpolation'
import colorNames from '../shared/colors'
import Spring, { config } from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Keyframes from '../../Keyframes'

Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues((instance, props) => {
  if (instance.nodeType) {
    instance._applyProps(instance, props)
  } else return false
}, style => style)

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
  Globals,
}
