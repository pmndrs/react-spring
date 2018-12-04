import * as Globals from '../../animated/Globals'
import Controller from '../../animated/Controller'
import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import { config } from '../../shared/constants'
import Spring from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Keyframes from '../../Keyframes'
import createInterpolation from '../../shared/interpolation'
import colorNames from '../../shared/colors'
import AnimatedTransform from './AnimatedTransform'
import { View } from 'react-native'

Globals.injectDefaultElement(View)
Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => ({ ...style, transform: new AnimatedTransform(style.transform) })
)

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Controller,
  config,
  animated,
  interpolate,
  Globals,
}
