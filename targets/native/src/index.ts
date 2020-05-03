import { StyleSheet } from 'react-native'
import { AnimatedTransform } from './AnimatedTransform'
import { AnimatedStyle, AnimatedObject } from 'animated'
import { createStringInterpolator } from 'shared/stringInterpolation'
import { is, Globals } from 'shared'
import colorNames from 'shared/colors'

Globals.assign({
  colorNames,
  createStringInterpolator,
  applyAnimatedValues(instance, props) {
    if (is.und(props.children) && instance.setNativeProps) {
      instance.setNativeProps(props)
      return true
    }
    return false
  },
  createAnimatedTransform: transform => new AnimatedTransform(transform),
  createAnimatedStyle(styles) {
    styles = StyleSheet.flatten(styles)
    if (is.obj(styles.shadowOffset)) {
      styles.shadowOffset = new AnimatedObject(styles.shadowOffset)
    }
    return new AnimatedStyle(styles)
  },
})

export * from './animated'
export * from 'core'
