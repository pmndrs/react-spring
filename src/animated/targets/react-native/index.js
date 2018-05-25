import createAnimatedComponent from '../../createAnimatedComponent'
import Interpolation from '../Interpolation'
import * as Globals from '../../Globals'
import { Text, View, Image } from 'react-native'

Globals.injectInterpolation(Interpolation)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => style
)

export const elements = {
  Text: createAnimatedComponent(Text),
  View: createAnimatedComponent(View),
  Image: createAnimatedComponent(Image),
}
