import * as Globals from '../../animated/Globals'
import Controller from '../../animated/Controller'
import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import { config } from '../../shared/constants'
import { useSpring } from '../../useSpring'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { useChain } from '../../useChain'
import { useSprings } from '../../useSprings'

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
  config,
  animated,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
}
