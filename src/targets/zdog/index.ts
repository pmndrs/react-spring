import * as Zdog from 'react-zdog'
import { interpolate } from '../../interpolate'
import animated from '../../animated/createAnimatedComponent'
import * as Globals from '../../animated/Globals'
import colorNames from '../../shared/colors'
import { config } from '../../shared/constants'
import createInterpolation from '../../shared/stringInterpolation'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { merge } from '../../shared/helpers'
import { update } from '../../animated/FrameLoop'

// Extend animated with all the available ZDOG elements
const {
  invalidate,
  applyProps,
  addEffect,
  useRender,
  Illustration,
  ...elements
} = Zdog
const apply = merge(animated, false)
const extendedAnimated = apply({})

for (let key of Object.keys(elements)) {
  extendedAnimated[key] = animated(elements[key])
}

if (addEffect) {
  // Add the update function as a global effect to react-zdog's update loop
  addEffect(update)
  // Ping react-three-fiber, so that it will call react-springs update function as an effect
  Globals.injectManualFrameloop(() => invalidate())
}

// Set default native-element
Globals.injectDefaultElement(Zdog.Anchor)
// Use default interpolation (which includes numbers, strings, colors)
Globals.injectStringInterpolator(createInterpolation)
// Inject color names, so that it will be able to deal with things like "peachpuff"
Globals.injectColorNames(colorNames)
// This is how we teach react-spring to set props "natively", the api is (instance, props) => { ... }
Globals.injectApplyAnimatedValues(applyProps, style => style)

export {
  apply,
  update,
  config,
  extendedAnimated as animated,
  extendedAnimated as a,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
