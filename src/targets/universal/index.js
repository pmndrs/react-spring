import * as Globals from '../../animated/Globals'
import Animation from '../../animated/Animation'
import AnimatedValue from '../../animated/AnimatedValue'
import SpringAnimation from '../../animated/SpringAnimation'
import controller from '../../animated/AnimatedController'
import Interpolation from '../../animated/Interpolation'
import animated from '../../animated/createAnimatedComponent'
import { config } from '../shared/constants'
import Spring from '../../Spring'
import Transition from '../../Transition'
import Trail from '../../Trail'
import Keyframes from '../../Keyframes'

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
function createInterpolation(config) {
  const outputRange = config.output
  const outputRanges = outputRange[0].match(stringShapeRegex).map(() => [])
  outputRange.forEach(value => {
    value
      .match(stringShapeRegex)
      .forEach((number, i) => outputRanges[i].push(+number))
  })
  const interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map((_, i) => Interpolation.create({ ...config, output: outputRanges[i] }))
  return input => {
    let i = 0
    return outputRange[0].replace(stringShapeRegex, () =>
      interpolations[i++](input)
    )
  }
}

// Render 30/fps by default
Globals.injectFrame(cb => setTimeout(cb, 1000 / 30), r => clearTimeout(r))
Globals.injectInterpolation(createInterpolation)
Globals.injectApplyAnimatedValues(() => false, style => style)

export {
  Spring,
  Keyframes,
  Transition,
  Trail,
  Animation,
  SpringAnimation,
  AnimatedValue,
  config,
  animated,
  controller,
  Globals,
}
