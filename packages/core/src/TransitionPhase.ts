export enum TransitionPhase {
  /** This transition is being mounted */
  MOUNT = 'mount',
  /** This transition is entering or has entered */
  ENTER = 'enter',
  /** This transition had its animations updated */
  UPDATE = 'update',
  /** This transition will expire after animating */
  LEAVE = 'leave',
}
