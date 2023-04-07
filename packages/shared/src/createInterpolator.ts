import * as G from './globals'
import { is } from './helpers'
import {
  Animatable,
  InterpolatorFn,
  EasingFunction,
  ExtrapolateType,
  InterpolatorConfig,
  InterpolatorFactory,
} from '@react-spring/types'

export const createInterpolator: InterpolatorFactory = (
  range: readonly number[] | InterpolatorFn<any, any> | InterpolatorConfig<any>,
  output?: readonly Animatable[],
  extrapolate?: ExtrapolateType
) => {
  if (is.fun(range)) {
    return range
  }

  if (is.arr(range)) {
    return createInterpolator({
      range,
      output: output!,
      extrapolate,
    })
  }

  if (is.str(range.output[0])) {
    return G.createStringInterpolator(range as any) as any
  }

  const config = range as InterpolatorConfig<number>
  const outputRange = config.output
  const inputRange = config.range || [0, 1]

  const extrapolateLeft =
    config.extrapolateLeft || config.extrapolate || 'extend'
  const extrapolateRight =
    config.extrapolateRight || config.extrapolate || 'extend'
  const easing = config.easing || (t => t)

  return (input: number) => {
    const range = findRange(input, inputRange)
    return interpolate(
      input,
      inputRange[range],
      inputRange[range + 1],
      outputRange[range],
      outputRange[range + 1],
      easing,
      extrapolateLeft,
      extrapolateRight,
      config.map
    )
  }
}

function interpolate(
  input: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  easing: EasingFunction,
  extrapolateLeft: ExtrapolateType,
  extrapolateRight: ExtrapolateType,
  map?: (x: number) => number
) {
  let result = map ? map(input) : input
  // Extrapolate
  if (result < inputMin) {
    if (extrapolateLeft === 'identity') return result
    else if (extrapolateLeft === 'clamp') result = inputMin
  }
  if (result > inputMax) {
    if (extrapolateRight === 'identity') return result
    else if (extrapolateRight === 'clamp') result = inputMax
  }
  if (outputMin === outputMax) return outputMin
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax
  // Input Range
  if (inputMin === -Infinity) result = -result
  else if (inputMax === Infinity) result = result - inputMin
  else result = (result - inputMin) / (inputMax - inputMin)
  // Easing
  result = easing(result)
  // Output Range
  if (outputMin === -Infinity) result = -result
  else if (outputMax === Infinity) result = result + outputMin
  else result = result * (outputMax - outputMin) + outputMin
  return result
}

function findRange(input: number, inputRange: readonly number[]) {
  // eslint-disable-next-line no-var
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break
  return i - 1
}
