/** @internal A value that changes over time (possibly every frame) */
export interface FluidValue<T = any> {
  get: () => T
  priority?: number
  addChild: (child: FluidObserver) => void
  removeChild: (child: FluidObserver) => void
}

/** @internal An object that observes a `FluidValue` over time */
export interface FluidObserver<T = any> {
  /** An observed `FluidValue` had its value changed */
  onParentChange(value: T, idle: boolean, parent: FluidValue<T>): void
  /** An observed `FluidValue` had its priority changed */
  onParentPriorityChange(priority: number, parent: FluidValue<T>): void
}

/** These types can be animated */
export type Animatable<T = any> = T extends number
  ? number
  : T extends string
  ? string
  : T extends ReadonlyArray<number | string>
  ? Array<number | string> extends T // When true, T is not a tuple
    ? ReadonlyArray<number | string>
    : { [P in keyof T]: Animatable<T[P]> }
  : never

export interface FrameRequestCallback {
  (time?: number): void
}
