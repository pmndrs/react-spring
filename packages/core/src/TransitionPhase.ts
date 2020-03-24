// TODO: convert to "const enum" once Babel supports it
export type TransitionPhase =
  | typeof MOUNT
  | typeof ENTER
  | typeof UPDATE
  | typeof LEAVE

/** This transition is being mounted */
export const MOUNT = 'mount'

/** This transition is entering or has entered */
export const ENTER = 'enter'

/** This transition had its animations updated */
export const UPDATE = 'update'

/** This transition will expire after animating */
export const LEAVE = 'leave'
