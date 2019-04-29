import { View, StyleSheet } from 'react-native'
import { createStringInterpolator } from '../../shared/stringInterpolation'
import { AnimatedTransform } from './AnimatedTransform'
import { AnimatedStyle } from '../../animated/AnimatedStyle'
import colorNames from '../../shared/colors'
import * as Globals from '../../animated/Globals'

Globals.assign({
  defaultElement: View,
  colorNames,
  createStringInterpolator,
  applyAnimatedValues: (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  createAnimatedTransform: transform => new AnimatedTransform(transform),
  createAnimatedStyle: styles => new AnimatedStyle(StyleSheet.flatten(styles)),
  createAnimatedRef: (node, mounted, forceUpdate) => ({
    getNode: () => node.current,
    setNativeProps: props => {
      const didUpdate = Globals.applyAnimatedValues(node.current, props)
      if (!didUpdate) mounted!.current && forceUpdate!()
    },
  }),
})

export { Globals }
