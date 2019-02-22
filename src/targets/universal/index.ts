import { interpolate } from '../../animated/AnimatedInterpolation'
import animated from '../../animated/createAnimatedComponent'
import createInterpolation, {
  InterpolationConfig,
} from '../../animated/createInterpolation'
import * as Globals from '../../animated/Globals'
import { config } from '../../shared/constants'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
function createStringInterpolation(
  config: InterpolationConfig<number, string>
) {
  const outputRange = config.output
  const outputRanges: number[][] = outputRange[0]
    .match(stringShapeRegex)!
    .map(() => [])
  outputRange.forEach(value => {
    value
      .match(stringShapeRegex)!
      .forEach((number, i) => outputRanges[i].push(+number))
  })
  const interpolations = outputRange[0]
    .match(stringShapeRegex)!
    .map((_, i) => createInterpolation({ ...config, output: outputRanges[i] }))
  return (input: number) => {
    let i = 0
    return outputRange[0].replace(
      stringShapeRegex,
      () => interpolations[i++](input) as string
    )
  }
}

Globals.injectStringInterpolation(createStringInterpolation)
Globals.injectApplyAnimatedValues(() => false, style => style)

const Interpolation = {
  create: createInterpolator,
}

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
  Interpolation,
}
