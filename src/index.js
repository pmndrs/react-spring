import Animation from './animated/Animation'
import Value from './animated/AnimatedValue'
import { interpolate } from './animated/AnimatedInterpolation'
import { elements as animated } from './animated/targets/react-dom/index.js'
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
  animated,
  interpolate,
  Animation,
  Value,
}
