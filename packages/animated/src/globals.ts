import { Globals } from 'shared'
import { AnimatedStyle } from './AnimatedStyle'
import { Into } from './Into'

// Sane defaults
Globals.assign({
  to: (source, args) => new Into(source, args),
  createAnimatedStyle: style => new AnimatedStyle(style),
})
