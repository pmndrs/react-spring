import { Globals, InterpolatorConfig, createInterpolator } from 'shared'
import { FrameLoop } from './FrameLoop'

// Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662
const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g
const createStringInterpolator = (config: InterpolatorConfig<string>) => {
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

Globals.assign({
  frameLoop: new FrameLoop(),
  createStringInterpolator,
  applyAnimatedValues: () => false,
})

export { Globals }

/** Advance all animations forward one frame */
export const update = () => Globals.frameLoop.update()
