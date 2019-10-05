import { Globals } from 'core'
import { applyAnimatedValues } from './applyAnimatedValues'
import { createStringInterpolator } from 'shared/stringInterpolation'
import { AnimatedStyle } from './AnimatedStyle'
import colorNames from 'shared/colors'

Globals.assign({
  defaultElement: 'div',
  colorNames,
  applyAnimatedValues,
  createStringInterpolator,
  createAnimatedStyle: style => new AnimatedStyle(style),
  getComponentProps: ({ scrollTop, scrollLeft, ...props }) => props,
})

export * from './animated'
export * from 'core'
