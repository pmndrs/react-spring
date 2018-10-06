import { withDefault } from '../targets/shared/helpers'

export default {
  setGlobalConfig(config) {
    return {
      easing: withDefault(config.easing, t => t),
      duration: withDefault(config.duration, 500),
    }
  },
  setValueConfig(config) {
    return undefined
  },
  update(config, anim, from, to, pos, now, startTime, lastTime) {
    return [
      from + config.easing((now - startTime) / config.duration) * (to - from),
      now >= startTime + config.duration,
    ]
  },
}
