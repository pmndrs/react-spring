import { Animatable, SpringValue, InterpolatorArgs } from 'shared'
import { createAnimatedInterpolation as to } from 'shared/globals'
import { deprecateInterpolate } from 'shared/deprecations'

function interpolate<Out extends Animatable>(
  ...args: InterpolatorArgs<any, Out>
): SpringValue<Out> {
  deprecateInterpolate()
  return (to as any)(...args)
}

export { to, interpolate }
