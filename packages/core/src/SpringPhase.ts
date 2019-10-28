// TODO: use "const enum" when Babel supports it
export type SpringPhase =
  | typeof DISPOSED
  | typeof CREATED
  | typeof IDLE
  | typeof PAUSED
  | typeof ACTIVE

/** The spring has not animated yet */
export const CREATED = 'CREATED'

/** The spring has animated before */
export const IDLE = 'IDLE'

/** The spring is animating */
export const ACTIVE = 'ACTIVE'

/** The spring is frozen in time */
export const PAUSED = 'PAUSED'

/** The spring cannot be animated */
export const DISPOSED = 'DISPOSED'
