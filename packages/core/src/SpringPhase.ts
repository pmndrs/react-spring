/** The property symbol of the current animation phase. */
const $P = Symbol.for('SpringPhase')

const HAS_ANIMATED = 1
const IS_ANIMATING = 2
const IS_PAUSED = 4

/** Returns true if the `target` has ever animated. */
export const hasAnimated = (target: any) => (target[$P] & HAS_ANIMATED) > 0

/** Returns true if the `target` is animating (even if paused). */
export const isAnimating = (target: any) => (target[$P] & IS_ANIMATING) > 0

/** Returns true if the `target` is paused (even if idle). */
export const isPaused = (target: any) => (target[$P] & IS_PAUSED) > 0

/** Set the active bit of the `target` phase. */
export const setActiveBit = (target: any, active: boolean) =>
  active
    ? (target[$P] |= IS_ANIMATING | HAS_ANIMATED)
    : (target[$P] &= ~IS_ANIMATING)

export const setPausedBit = (target: any, paused: boolean) =>
  paused ? (target[$P] |= IS_PAUSED) : (target[$P] &= ~IS_PAUSED)
