export type Indexable<T = any> = { [key: string]: T }

export type OneOrMore<T> = T | ReadonlyArray<T>

/** Ensure each type of `T` is an array */
export type Arrify<T> = T extends ReadonlyArray<any> ? T : Readonly<[T]>

export type Falsy = false | null | undefined

export type OnEnd = (finished?: boolean) => void

/** For solving generic types */
export type Solve<T> = T

/** For resolving object intersections */
export type Remap<T> = Solve<{ [P in keyof T]: T[P] }>

/** Override the property types of `A` with `B` and merge any new properties */
export type Merge<A, B> = Solve<
  { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B
>

/** Return the keys of `T` with values that are assignable to `U` */
export type AssignableKeys<T, U> = T extends object
  ? U extends object
    ? {
        [P in Extract<keyof T, keyof U>]: T[P] extends U[P] ? P : never
      }[Extract<keyof T, keyof U>]
    : never
  : never
