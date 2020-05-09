import { StyleSheet } from 'react-native'
import { createHost, AnimatedObject } from 'animated'
import { createStringInterpolator } from 'shared/stringInterpolation'
import { is, Globals } from 'shared'
import colorNames from 'shared/colors'
import { primitives } from './primitives'
import { WithAnimated } from './animated'
import { AnimatedStyle } from './AnimatedStyle'

Globals.assign({
  colorNames,
  createStringInterpolator,
})

const host = createHost(primitives, {
  applyAnimatedValues(instance, props) {
    if (is.und(props.children) && instance.setNativeProps) {
      instance.setNativeProps(props)
      return true
    }
    return false
  },
  createAnimatedStyle(styles) {
    styles = StyleSheet.flatten(styles)
    if (is.obj(styles.shadowOffset)) {
      styles.shadowOffset = new AnimatedObject(styles.shadowOffset)
    }
    return new AnimatedStyle(styles)
  },
})

export const animated = host.animated as WithAnimated
export { animated as a }

export * from './animated'
export * from 'core'
