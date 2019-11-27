export type Indexable<T = any> = { [key: string]: T; [i: number]: T }

export type OneOrMore<T> = T | readonly T[]

/** Ensure each type of `T` is an array */
export type Arrify<T> = [T, T] extends [infer T, infer DT]
  ? DT extends ReadonlyArray<any>
    ? Array<DT[number]> extends DT
      ? ReadonlyArray<T extends ReadonlyArray<infer U> ? U : T>
      : DT
    : ReadonlyArray<T extends ReadonlyArray<infer U> ? U : T>
  : never

export type Falsy = false | null | undefined

export type AnyFn<In extends ReadonlyArray<any> = any[], Out = any> = (
  ...args: In
) => Out

/** For solving generic types */
export type Solve<T> = T

/** For resolving object intersections */
export type Remap<T> = Solve<{ [P in keyof T]: T[P] }>

/** Override the property types of `A` with `B` and merge any new properties */
export type Merge<A, B> = { [P in keyof A]: P extends keyof B ? B[P] : A[P] } &
  Omit<B, keyof A>

/** Same as `Merge<A, B>` except the property descriptions from `B` override those of `A` */
export type Overwrite<A, B> = Omit<A, keyof B> & B

/** An object partial with the same type for every value */
export type KeyedPartial<K extends string | number, T> = {
  [P in K]?: T
}

/** Return the keys of `T` with values that are assignable to `U` */
export type AssignableKeys<T, U> = T extends object
  ? U extends object
    ? {
        [P in Extract<keyof T, keyof U>]: T[P] extends U[P] ? P : never
      }[Extract<keyof T, keyof U>]
    : never
  : never

/** Give "any" its own class */
export declare class Any {
  _: never
}

/** Better type errors for overloads with generic types */
export type Constrain<T, U> = [T] extends [Any] ? U : [T] extends [U] ? T : U

/** Ensure the given type is an object type */
export type ObjectType<T> = T extends {} ? T : {}

/** Intersected with other object types to allow for unknown properties */
export type UnknownProps = Indexable<unknown>

export type UnknownPartial<T> = UnknownProps & Partial<T>

/** Extract string keys from an object type */
export type StringKeys<T> = T extends object ? Extract<keyof T, string> : string

// https://github.com/microsoft/TypeScript/issues/14829#issuecomment-504042546
export type NoInfer<T> = [T][T extends any ? 0 : never]

/** Intersect a union of objects but merge property types with _unions_ */
export type ObjectFromUnion<T extends object> = Remap<
  {
    [P in keyof Intersect<T>]: T extends infer U
      ? P extends keyof U
        ? U[P]
        : never
      : never
  }
>

/** Convert a union to an intersection */
type Intersect<U> = (U extends any
? (k: U) => void
: never) extends (k: infer I) => void
  ? I
  : never
