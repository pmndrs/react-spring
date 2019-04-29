import { View, Text } from 'react-native'
import {
  createAnimatedComponent,
  withExtend,
} from '../../animated/createAnimatedComponent'
import {
  AnimatedComponent,
  CreateAnimatedComponent,
} from '../../types/animated'

export { update } from '../../animated/FrameLoop'

// These are converted into `animated` components
const elements = {
  View,
  Text,
}

type NativeElements = typeof elements
type NativeComponents = {
  [P in keyof NativeElements]: AnimatedComponent<NativeElements[P]>
}

export const animated = withExtend(
  createAnimatedComponent as CreateAnimatedComponent & NativeComponents
).extend(elements)

export { animated as a }

/** @deprecated Use `animated.extend` instead */
export const apply = animated.extend
