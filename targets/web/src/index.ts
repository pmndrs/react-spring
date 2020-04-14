import { Globals } from 'core'
import { unstable_batchedUpdates } from 'react-dom'
import { createStringInterpolator } from 'shared/stringInterpolation'
import colorNames from 'shared/colors'
import { applyAnimatedValues } from './applyAnimatedValues'
import { AnimatedStyle } from './AnimatedStyle'

Globals.assign({
  defaultElement: 'div',
  colorNames,
  applyAnimatedValues,
  createStringInterpolator,
  createAnimatedStyle: style => new AnimatedStyle(style),
  getComponentProps: ({ scrollTop, scrollLeft, ...props }) => props,
  batchedUpdates: unstable_batchedUpdates,
})

declare const document: any

// Skip animation when the user isn't looking.
document.addEventListener('visibilitychange', () =>
  Globals.assign({
    skipAnimation: document.visibilityState !== 'visible',
  })
)

export * from './animated'
export * from 'core'
