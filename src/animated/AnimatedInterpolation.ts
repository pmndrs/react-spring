import Animated, { AnimatedArrayWithChildren } from './Animated'
import createInterpolation, { InterpolationConfig } from './createInterpolation'

export default class AnimatedInterpolation extends AnimatedArrayWithChildren {
  calc: any

  constructor(
    parents: Animated | Animated[],
    config: InterpolationConfig,
    arg: any
  ) {
    super()
    this.payload =
      // AnimatedArrays should unfold, except AnimatedInterpolation which is taken as is
      parents instanceof AnimatedArrayWithChildren &&
      !(parents as AnimatedInterpolation).updateConfig
        ? parents.payload
        : Array.isArray(parents)
        ? parents
        : [parents]
    this.calc = createInterpolation(config as any, arg)
  }

  getValue = () => this.calc(...this.payload.map(value => value.getValue()))

  updateConfig = (config: InterpolationConfig, arg: any) => {
    this.calc = createInterpolation(config as any, arg)
  }

  interpolate = (config: InterpolationConfig, arg: any) =>
    new AnimatedInterpolation(this, config, arg)
}

export const interpolate = (
  parents: Animated | Animated[],
  config: InterpolationConfig,
  arg: any
) => parents && new AnimatedInterpolation(parents, config, arg)
