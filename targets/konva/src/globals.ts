import { Globals } from 'shared'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

Globals.assign({
  defaultElement: 'Group',
  createStringInterpolator,
  colorNames,
  applyAnimatedValues(instance, props) {
    if (!instance.nodeType) return false
    instance._applyProps(instance, props)
  },
})

export { Globals }
