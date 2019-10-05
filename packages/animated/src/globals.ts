import { Globals } from 'shared'
import { AnimatedStyle } from './AnimatedStyle'

// Sane defaults
Globals.assign({
  createAnimatedStyle: style => new AnimatedStyle(style),
})
