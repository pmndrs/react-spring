import * as Globals from '../../animated/Globals'
import Controller from '../../animated/Controller'
import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import { config } from '../../shared/constants'
import AnimatedStyle from '../../animated/AnimatedStyle'
import createInterpolation from '../../shared/interpolation'
import colorNames from '../../shared/colors'
import AnimatedTransform from './AnimatedTransform'
import AnimatedStyles from './AnimatedStyles'
import { useSpring } from '../../hooks/useSpring'
import { useTrail } from '../../hooks/useTrail'
import { useTransition } from '../../hooks/useTransition'
import { useKeyframes } from '../../hooks/useKeyframes'
import { useChain } from '../../hooks/useChain'
import { useSprings } from '../../hooks/useSprings'
import { View } from 'react-native'

Globals.injectDefaultElement(View)
Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => ({ ...style, transform: new AnimatedTransform(style.transform) })
)
Globals.injectCreateAnimatedStyle(styles =>
  Array.isArray(styles) ? new AnimatedStyles(styles) : new AnimatedStyle(styles)
)

export {
  config,
  extendedAnimated as animated,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useKeyframes,
  useChain,
  useSprings,
}
