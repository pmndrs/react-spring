import { Remap, Any } from '@alloc/types'

export * from '@alloc/types'

/** Ensure each type of `T` is an array */
export type Arrify<T> = [T, T] extends [infer T, infer DT]
  ? DT extends ReadonlyArray<any>
    ? Array<DT[number]> extends DT
      ? ReadonlyArray<T extends ReadonlyArray<infer U> ? U : T>
      : DT
    : ReadonlyArray<T extends ReadonlyArray<infer U> ? U : T>
  : never

/** Override the property types of `A` with `B` and merge any new properties */
export type Merge<A, B> = Remap<
  { [P in keyof A]: P extends keyof B ? B[P] : A[P] } & Omit<B, keyof A>
>

/** Return the keys of `T` with values that are assignable to `U` */
export type AssignableKeys<T, U> = T extends object
  ? U extends object
    ? {
        [P in Extract<keyof T, keyof U>]: T[P] extends U[P] ? P : never
      }[Extract<keyof T, keyof U>]
    : never
  : never

/** Better type errors for overloads with generic types */
export type Constrain<T, U> = [T] extends [Any] ? U : [T] extends [U] ? T : U
