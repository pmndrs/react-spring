import { withDefault } from '../targets/shared/helpers'

const stiffnessFromOrigamiValue = oValue => (oValue - 30) * 3.62 + 194
const dampingFromOrigamiValue = oValue => (oValue - 8) * 3 + 25
const fromOrigamiTensionAndFriction = (tension, friction) => ({
  stiffness: stiffnessFromOrigamiValue(tension),
  damping: dampingFromOrigamiValue(friction),
})

export default {
  setGlobalConfig(config) {
    var springConfig = fromOrigamiTensionAndFriction(
      withDefault(config.tension, 170),
      withDefault(config.friction, 26)
    )
    return {
      overshootClamping: withDefault(config.overshootClamping, false),
      restDisplacementThreshold: withDefault(
        config.restDisplacementThreshold,
        0.0001
      ),
      restSpeedThreshold: withDefault(config.restSpeedThreshold, 0.0001),
      initialVelocity: withDefault(config.velocity, 0),
      stiffness: springConfig.stiffness,
      damping: springConfig.damping,
      mass: withDefault(config.mass, 1),
    }
  },
  setValueConfig(config) {
    let lastVel = withDefault(config.velocity, 0)
    return { lastVel, frameTime: 0 }
  },
  update(config, anim, from, to, pos, now, startTime, lastTime) {
    // If for some reason we lost a lot of frames (e.g. process large payload or
    // stopped in the debugger), we only advance by 4 frames worth of
    // computation and will continue on the next frame. It's better to have it
    // running at faster speed than jumping to the end.
    const MAX_STEPS = 64
    if (now > lastTime + MAX_STEPS) now = lastTime + MAX_STEPS

    const deltaTime = (now - lastTime) / 1000
    anim.frameTime += deltaTime

    const c = config.damping
    const m = config.mass
    const k = config.stiffness
    const v0 = -config.initialVelocity

    const zeta = c / (2 * Math.sqrt(k * m)) // damping ratio
    const omega0 = Math.sqrt(k / m) // undamped angular frequency of the oscillator (rad/ms)
    const omega1 = omega0 * Math.sqrt(1.0 - zeta * zeta) // exponential decay
    const x0 = to - from // calculate the oscillation from x0 = 1 to x = 0

    let position = 0.0
    let velocity = 0.0
    const t = anim.frameTime
    if (zeta < 1) {
      // Under damped
      const envelope = Math.exp(-zeta * omega0 * t)
      position =
        to -
        envelope *
          (((v0 + zeta * omega0 * x0) / omega1) * Math.sin(omega1 * t) +
            x0 * Math.cos(omega1 * t))
      // This looks crazy -- it's actually just the derivative of the
      // oscillation function
      velocity =
        zeta *
          omega0 *
          envelope *
          ((Math.sin(omega1 * t) * (v0 + zeta * omega0 * x0)) / omega1 +
            x0 * Math.cos(omega1 * t)) -
        envelope *
          (Math.cos(omega1 * t) * (v0 + zeta * omega0 * x0) -
            omega1 * x0 * Math.sin(omega1 * t))
    } else {
      // Critically damped
      const envelope = Math.exp(-omega0 * t)
      position = to - envelope * (x0 + (v0 + omega0 * x0) * t)
      velocity = envelope * (v0 * (t * omega0 - 1) + t * x0 * (omega0 * omega0))
    }

    // Conditions for stopping the spring animation
    let isOvershooting = false
    if (config.overshootClamping && config.stiffness !== 0)
      isOvershooting = from < to ? position > to : position < to

    const isVelocity = Math.abs(velocity) <= config.restSpeedThreshold
    let isDisplacement = true
    if (config.stiffness !== 0)
      isDisplacement =
        Math.abs(to - position) <= config.restDisplacementThreshold

    return [position, isOvershooting || (isVelocity && isDisplacement)]
  },
}
