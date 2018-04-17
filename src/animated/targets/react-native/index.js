import createAnimatedComponent from '../../createAnimatedComponent'
import Globals from '../../Globals'

Globals.injectApplyAnimatedValues(
  (instance, props) =>
    instance.setNativeProps ? instance.setNativeProps(props) : false,
  style => style
)
