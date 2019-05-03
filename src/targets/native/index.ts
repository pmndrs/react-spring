import { StyleSheet, View } from 'react-native'
import AnimatedStyle from '../../animated/AnimatedStyle'
import animated from '../../animated/createAnimatedComponent'
import * as Globals from '../../animated/Globals'
import { update } from '../../animated/FrameLoop'
import { interpolate } from '../../interpolate'
import colorNames from '../../shared/colors'
import { config } from '../../shared/constants'
import createStringInterpolator from '../../shared/stringInterpolation'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import AnimatedTransform from './AnimatedTransform'
import { merge } from '../../shared/helpers'

Globals.injectDefaultElement(View)
Globals.injectStringInterpolator(createStringInterpolator)
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
    const didUpdate = Globals.applyAnimatedValues.fn(node.current, props)
    if (!didUpdate) mounted!.current && forceUpdate!()
  },
  getNode: () => node.current,
}))

const apply = merge(animated)

export {
  apply,
  config,
  update,
  animated,
  animated as a,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
