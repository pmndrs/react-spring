import { FluidValue } from 'fluids'

/** Add the `FluidValue` type to every property */
export type FluidProps<T> = T extends object
  ? { [P in keyof T]: T[P] | FluidValue<Exclude<T[P], void>> }
  : unknown

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
