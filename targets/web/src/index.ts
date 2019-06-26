import { Globals } from '@react-spring/core'
import { applyAnimatedValues } from './applyAnimatedValues'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'

Globals.assign({
  defaultElement: 'div',
  colorNames,
  applyAnimatedValues,
  createStringInterpolator,
  getComponentProps: ({ scrollTop, scrollLeft, ...props }) => props,
})

export * from './animated'
export * from '@react-spring/core'
