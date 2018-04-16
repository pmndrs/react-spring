import Animation from './animated/Animation'
import Value from './animated/AnimatedValue'
import { template, interpolate } from './animated/index.js'
import { elements as animated } from './animated/targets/react-dom'
import Spring, { config } from './Spring'
import Transition from './Transition'
import Trail from './Trail'
import Parallax, { ParallaxLayer } from './Parallax'
import Keyframes from './Keyframes'

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Parallax,
  ParallaxLayer,
  config,
  template,
  animated,
  interpolate,
  Animation,
  Value,
}
