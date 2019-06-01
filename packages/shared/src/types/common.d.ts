export declare type Indexable<T = any> = {
  [key: string]: T
}
export declare type OneOrMore<T> = T | ReadonlyArray<T>
export declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
/** Ensure each type of `T` is an array */
export declare type Arrify<T> = T extends ReadonlyArray<any> ? T : Readonly<[T]>
export declare type Falsy = false | null | undefined
export declare type OnEnd = (finished?: boolean) => void
/** For solving generic types */
export declare type Solve<T> = T
/** For resolving object intersections */
export declare type Remap<T> = Solve<{ [P in keyof T]: T[P] }>
/** Override the property types of `A` with `B` and merge any new properties */
export declare type Merge<A, B> = Solve<
  { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B
>
/** Return the keys of `T` with values that are assignable to `U` */
export declare type AssignableKeys<T, U> = T extends object
  ? U extends object
    ? {
        [P in Extract<keyof T, keyof U>]: T[P] extends U[P] ? P : never
      }[Extract<keyof T, keyof U>]
    : never
  : never
