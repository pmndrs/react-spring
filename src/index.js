import Animated from './animated/targets/react-dom'
import Spring, { config } from './Spring'
import Transition from './Transition'
import Trail from './Trail'
import Parallax from './Parallax'

const animated = Animated.elements
const template = Animated.template
const interpolate = Animated.interpolate

export { Spring, Transition, Trail, Parallax, config, template, animated, interpolate }
