import createAnimatedComponent from '../../createAnimatedComponent'
import Interpolation from '../Interpolation'
import Globals from '../../Globals'

Globals.injectInterpolation(Interpolation)
Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => style
)
