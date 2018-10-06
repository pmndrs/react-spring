import { withDefault } from '../targets/shared/helpers'

const tensionFromOrigamiValue = oValue => (oValue - 30) * 3.62 + 194
const frictionFromOrigamiValue = oValue => (oValue - 8) * 3 + 25
const fromOrigamiTensionAndFriction = (tension, friction) => ({
  tension: tensionFromOrigamiValue(tension),
  friction: frictionFromOrigamiValue(friction),
})

export default {
  setGlobalConfig(config) {
    let springConfig = fromOrigamiTensionAndFriction(
      withDefault(config.tension, 170),
      withDefault(config.friction, 26)
    )
    return {
      overshootClamping: withDefault(config.overshootClamping, false),
      precision: withDefault(config.precision, 0.01),
      tension: springConfig.tension,
      friction: springConfig.friction,
      mass: withDefault(config.mass, 1),
    }
  },
  setValueConfig(config) {
    let lastVel = withDefault(config.velocity, 0)
    return { lastVel }
  },
  update(config, anim, from, to, pos, now, startTime, lastTime) {
    let position = pos
    let velocity = anim.lastVel

    // If for some reason we lost a lot of frames (e.g. process large payload or
    // stopped in the debugger), we only advance by 4 frames worth of
    // computation and will continue on the next frame. It's better to have it
    // running at faster speed than jumping to the end.
    let MAX_STEPS = 64
    if (now > lastTime + MAX_STEPS) now = lastTime + MAX_STEPS
    // We are using a fixed time step and a maximum number of iterations.
    // The following post provides a lot of thoughts into how to build this
    // loop: http://gafferongames.com/game-physics/fix-your-timestep/
    let TIMESTEP_MSEC = 1
    let numSteps = Math.floor((now - lastTime) / TIMESTEP_MSEC)

    for (let i = 0; i < numSteps; ++i) {
      // Velocity is based on seconds instead of milliseconds
      let step = TIMESTEP_MSEC / 1000
      // for animations, destX is really spring length (spring at rest). initial
      // position is considered as the stretched/compressed position of a spring
      const force = -config.tension * (position - to)
      const damping = -config.friction * velocity
      const acceleration = (force + damping) / config.mass
      velocity = velocity + acceleration * step
      position = position + velocity * step
    }

    // Conditions for stopping the spring animation
    let isOvershooting =
      config.overshootClamping && config.tension !== 0
        ? from < to
          ? position > to
          : position < to
        : false
    let isVelocity = Math.abs(velocity) <= config.precision
    let isDisplacement =
      config.tension !== 0 ? Math.abs(to - position) <= config.precision : true

    anim.lastVel = velocity
    return [position, isOvershooting || (isVelocity && isDisplacement)]
  },
}
