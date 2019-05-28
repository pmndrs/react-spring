/** For solving generic types */
export type Solve<T> = T
export type Remap<T> = { [P in keyof T]: T[P] }

export type Indexable<T = any> = { [key: string]: T }

export type OneOrMore<T> = T | ReadonlyArray<T>

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/** Ensure each type of `T` is an array */
export type Arrify<T> = T extends ReadonlyArray<any> ? T : Readonly<[T]>

export type Falsy = false | null | undefined

export type OnEnd = (finished?: boolean) => void

/** Override the property types of `A` with `B` and merge any new properties */
export type Merge<A, B> = Solve<
  { [K in keyof A]: K extends keyof B ? B[K] : A[K] } & B
>
