const ApplyAnimatedValues = {
  current: function ApplyAnimatedValues(instance, props) {
    if (instance.setNativeProps) instance.setNativeProps(props)
    else return false
  },

  transformStyles: function transformStyles(style) {
    return style
  },

  inject(apply, transform) {
    ApplyAnimatedValues.current = apply
    ApplyAnimatedValues.transformStyles = transform
  },
}

export default ApplyAnimatedValues
