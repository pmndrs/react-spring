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

// Extend animated with all the available ZDOG elements, so that we can do animated.Shape/Ellipse/.. later on
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
  // Add react-springs update function as a global effect to react-zdog's render loop
  // Having multiple requestAnimationFrame-loops is very bad for performance, so we join them
  addEffect(update)
  // This one switches off react-springs own render loop, instead it will call us back whenever
  // it needs to render, we use this to invalidate react-zdog's render loop, in case it renders on demand
  Globals.injectManualFrameloop(() => invalidate())
}

// Set default native-element
Globals.injectDefaultElement(Zdog.Anchor)
// Use default interpolation (which includes numbers, strings, colors), zdog uses web standards
Globals.injectStringInterpolator(createInterpolation)
// Inject web color names, so that it will be able to deal with things like "peachpuff"
Globals.injectColorNames(colorNames)
// This is how we teach react-spring to set props "natively", the api is (instance, props) => { ... }
// It will write updates directly into the view from now on, avoiding component updates through React
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
