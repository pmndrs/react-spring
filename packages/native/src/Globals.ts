import { View, StyleSheet } from 'react-native'
import { AnimatedTransform } from './AnimatedTransform'
import { AnimatedStyle, AnimatedObject } from '@react-spring/animated'
import { createStringInterpolator } from 'shared/stringInterpolation'
import { is, Globals } from 'shared'
import colorNames from 'shared/colors'

Globals.assign({
  defaultElement: View,
  colorNames,
  createStringInterpolator,
  applyAnimatedValues: (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  createAnimatedTransform: transform => new AnimatedTransform(transform),
  createAnimatedStyle(styles) {
    styles = StyleSheet.flatten(styles)
    if (is.obj(styles.shadowOffset)) {
      styles.shadowOffset = new AnimatedObject(styles.shadowOffset)
    }
    return new AnimatedStyle(styles)
  },
  createAnimatedRef: (node, mounted, forceUpdate) => ({
    getNode: () => node.current,
    setNativeProps: props => {
      const didUpdate = Globals.applyAnimatedValues(node.current, props)
      if (!didUpdate && mounted.current) forceUpdate()
    },
  }),
})

export { Globals }
