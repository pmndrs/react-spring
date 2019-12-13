import { is } from 'shared'
import { config as configs } from './constants'

const defaultConfig = configs.default
const linear = (t: number) => t

export class AnimationConfig {
  /**
   * With higher tension, the spring will resist bouncing and try harder to stop at its end value.
   *
   * When tension is zero, no animation occurs.
   */
  tension: number = defaultConfig.tension

  /**
   * The damping ratio coefficient, or just the damping ratio when `speed` is defined.
   *
   * When `speed` is defined, this value should be between 0 and 1.
   *
   * Higher friction means the spring will slow down faster.
   */
  friction: number = defaultConfig.friction

  /**
   * The natural frequency (in seconds), which dictates the number of bounces
   * per second when no damping exists.
   *
   * When defined, `tension` is derived from this, and `friction` is derived
   * from `tension` and `damping`.
   */
  frequency?: number

  /**
   * The damping ratio, which dictates how the spring slows down.
   *
   * Set to `0` to never slow down. Set to `1` to slow down without bouncing.
   * Between `0` and `1` is for you to explore.
   *
   * Only works when `frequency` is defined.
   *
   * Defaults to 1
   */
  damping = 1

  /**
   * Higher mass means more friction is required to slow down.
   *
   * Defaults to 1, which works fine most of the time.
   */
  mass = 1

  /**
   * The initial velocity of one or more values.
   */
  velocity: number | number[] = 0

  /**
   * The smallest velocity before the animation is considered "not moving".
   *
   * When undefined, `precision` is used instead.
   */
  restVelocity?: number

  /**
   * The smallest distance from a value before that distance is essentially zero.
   *
   * This helps in deciding when a spring is "at rest". The spring must be within
   * this distance from its final value, and its velocity must be lower than this
   * value too (unless `restVelocity` is defined).
   */
  precision?: number

  /**
   * For `duration` animations only. Note: The `duration` is not affected
   * by this property.
   *
   * Defaults to `0`, which means "start from the beginning".
   *
   * Setting to `1+` makes an immediate animation.
   *
   * Setting to `0.5` means "start from the middle of the easing function".
   *
   * Any number `>= 0` and `<= 1` makes sense here.
   */
  progress?: number

  /**
   * Animation length in number of milliseconds.
   */
  duration?: number

  /**
   * The animation curve. Only used when `duration` is defined.
   *
   * Defaults to quadratic ease-in-out.
   */
  easing = linear

  /**
   * Avoid overshooting by ending abruptly at the goal value.
   */
  clamp = false

  /**
   * When above zero, the spring will bounce instead of overshooting when
   * exceeding its goal value. Its velocity is multiplied by `-1 + bounce`
   * whenever its current value equals or exceeds its goal. For example,
   * setting `bounce` to `0.5` chops the velocity in half on each bounce,
   * in addition to any friction.
   */
  bounce?: number

  /**
   * "Decay animations" decelerate without an explicit goal value.
   * Useful for scrolling animations.
   *
   * Use `true` for the default exponential decay factor (`0.998`).
   *
   * When a `number` between `0` and `1` is given, a lower number makes the
   * animation slow down faster. And setting to `1` would make an unending
   * animation.
   */
  decay?: boolean | number

  /**
   * While animating, round to the nearest multiple of this number.
   * The `from` and `to` values are never rounded, as well as any value
   * passed to the `set` method of an animated value.
   */
  round?: number
}

const isMassConfig = (config: Partial<AnimationConfig>) =>
  !is.und(config.mass) ||
  !is.und(config.tension) ||
  !is.und(config.friction) ||
  !is.und(config.frequency) ||
  !is.und(config.damping)

const canMergeConfig = (
  config: Partial<AnimationConfig>,
  props: Partial<AnimationConfig>
) =>
  !is.und(config.duration)
    ? is.und(props.decay) && !isMassConfig(props)
    : is.und(props.duration) &&
      (is.und(config.decay) ? is.und(props.decay) : !isMassConfig(props))

export function mergeConfig(
  config: AnimationConfig,
  newConfig: Partial<AnimationConfig>,
  defaultConfig?: Partial<AnimationConfig>
) {
  if (!canMergeConfig(config, newConfig)) {
    config = new AnimationConfig()
  }

  if (defaultConfig) {
    if (!canMergeConfig(defaultConfig, newConfig)) {
      const {
        mass,
        tension,
        friction,
        decay,
        duration,
        frequency,
        damping,
        ...restConfig
      } = defaultConfig

      defaultConfig = restConfig
    }

    Object.assign(config, defaultConfig, newConfig)
  } else {
    Object.assign(config, newConfig)
  }

  let { mass, frequency, damping } = config
  if (!is.und(frequency)) {
    if (frequency < 0.01) frequency = 0.01
    if (damping < 0) damping = 0
    config.tension = Math.pow((2 * Math.PI) / frequency, 2) * mass
    config.friction = (4 * Math.PI * damping * mass) / frequency
  }

  return config
}
