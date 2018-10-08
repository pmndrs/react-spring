/**
 * Runge Kutta Order 4
 *
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @author https://github.com/vjeux (Christopher Chedeau)
 */

import { withDefault } from '../shared/helpers'

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
      restDisplacementThreshold: withDefault(
        config.restDisplacementThreshold,
        0.0001
      ),
      restSpeedThreshold: withDefault(config.restSpeedThreshold, 0.0001),
      initialVelocity: config.velocity,
      tension: springConfig.tension,
      friction: springConfig.friction,
    }
  },
  setValueConfig(config) {
    let lastVel = withDefault(config.velocity, 0)
    return { lastVel }
  },
  update(config, anim, from, to, pos, now, startTime, lastTime) {
    let position = pos
    let tempPosition = pos
    let velocity = anim.lastVel
    let tempVelocity = anim.lastVel

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

      // This is using RK4. A good blog post to understand how it works:
      // http://gafferongames.com/game-physics/integration-basics/
      let aVelocity = velocity
      let aAcceleration =
        config.tension * (to - tempPosition) - config.friction * tempVelocity
      tempPosition = position + (aVelocity * step) / 2
      tempVelocity = velocity + (aAcceleration * step) / 2
      let bVelocity = tempVelocity
      let bAcceleration =
        config.tension * (to - tempPosition) - config.friction * tempVelocity
      tempPosition = position + (bVelocity * step) / 2
      tempVelocity = velocity + (bAcceleration * step) / 2
      let cVelocity = tempVelocity
      let cAcceleration =
        config.tension * (to - tempPosition) - config.friction * tempVelocity
      tempPosition = position + (cVelocity * step) / 2
      tempVelocity = velocity + (cAcceleration * step) / 2
      let dVelocity = tempVelocity
      let dAcceleration =
        config.tension * (to - tempPosition) - config.friction * tempVelocity
      tempPosition = position + (cVelocity * step) / 2
      tempVelocity = velocity + (cAcceleration * step) / 2
      let dxdt = (aVelocity + 2 * (bVelocity + cVelocity) + dVelocity) / 6
      let dvdt =
        (aAcceleration + 2 * (bAcceleration + cAcceleration) + dAcceleration) /
        6
      position += dxdt * step
      velocity += dvdt * step
    }

    // Conditions for stopping the spring animation
    let isOvershooting =
      config.overshootClamping && config.tension !== 0
        ? from < to
          ? position > to
          : position < to
        : false

    let isVelocity = Math.abs(velocity) <= config.restSpeedThreshold
    let isDisplacement =
      config.tension !== 0
        ? Math.abs(to - position) <= config.restDisplacementThreshold
        : true

    let endOfAnimation = isOvershooting || (isVelocity && isDisplacement)

    anim.lastVel = velocity

    return [position, endOfAnimation]
  },
}
