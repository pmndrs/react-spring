import animated from '../../animated/createAnimatedComponent'
import createInterpolator from '../../animated/createInterpolator'
import * as Globals from '../../animated/Globals'
import { update } from '../../animated/FrameLoop'
import { interpolate } from '../../interpolate'
import { config } from '../../shared/constants'
import { InterpolationConfig } from '../../types/interpolation'
import { useChain } from '../../useChain'
import { useSpring } from '../../useSpring'
import { useSprings } from '../../useSprings'
import { useTrail } from '../../useTrail'
import { useTransition } from '../../useTransition'
import { merge } from '../../shared/helpers'

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
const createStringInterpolator = (config: InterpolationConfig<string>) => {
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
    .map((_, i) => createInterpolator({ ...config, output: outputRanges[i] }))
  return (input: number) => {
    let i = 0
    return outputRange[0].replace(
      stringShapeRegex,
      () => (interpolations[i++](input) as unknown) as string
    )
  }
}

Globals.injectStringInterpolator(createStringInterpolator)
Globals.injectApplyAnimatedValues(() => false, style => style)

const apply = merge(animated, false)
const Interpolation = {
  create: createInterpolator,
}

export {
  apply,
  config,
  update,
  animated,
  animated as a,
  interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
  Interpolation,
}
