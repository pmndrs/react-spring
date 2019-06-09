import { Globals } from 'shared'
import { AnimatedStyle } from './AnimatedStyle'
import { AnimatedInterpolation } from './AnimatedInterpolation'

// Sane defaults
Globals.assign({
  createAnimatedStyle: style => new AnimatedStyle(style),
  createAnimatedInterpolation: (parents: any, ...args: [any]) =>
    new AnimatedInterpolation(parents, args),
})
