import * as Globals from '../../animated/Globals'
import Controller from '../../animated/Controller'
import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import { config } from '../../shared/constants'
import AnimatedStyle from '../../animated/AnimatedStyle'
import createInterpolation from '../../shared/interpolation'
import colorNames from '../../shared/colors'
import AnimatedTransform from './AnimatedTransform'
import { StyleSheet, View } from 'react-native'
import { useSpring } from '../../useSpring'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { useChain } from '../../useChain'
import { useSprings } from '../../useSprings'

Globals.injectDefaultElement(View)
Globals.injectInterpolation(createInterpolation)
Globals.injectColorNames(colorNames)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => ({ ...style, transform: new AnimatedTransform(style.transform) })
)
Globals.injectCreateAnimatedStyle(
  styles => new AnimatedStyle(StyleSheet.flatten(styles))
)
Globals.injectAnimatedApi((node, mounted, forceUpdate) => ({
  setNativeProps: props => {
    const didUpdate = ApplyAnimatedValues(node.current, props)
    if (!didUpdate) mounted.current && forceUpdate()
  },
  getNode: () => node.current,
}))

export {
  config,
  animated,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
