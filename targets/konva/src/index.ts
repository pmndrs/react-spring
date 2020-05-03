import { Globals } from 'shared'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

Globals.assign({
  createStringInterpolator,
  colorNames,
  applyAnimatedValues(instance, props) {
    if (!instance.nodeType) return false
    instance._applyProps(instance, props)
  },
})

export * from './animated'
export * from 'core'
