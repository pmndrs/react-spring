export type Indexable<T = any> = { [key: string]: T }

export type OneOrMore<T> = T | ReadonlyArray<T>

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

/** Ensure each type of `T` is an array */
export type Arrify<T> = T extends ReadonlyArray<any> ? T : Readonly<[T]>

export type Falsy = false | null | undefined

export type OnEnd = (finished?: boolean) => void
