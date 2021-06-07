declare const console: any

const prefix = 'react-spring: '

const once = <TFunc extends (...args: any) => any>(fn: TFunc) => {
  const func = fn
  let called = false

  if (typeof func != 'function') {
    throw new TypeError(`${prefix}once requires a function parameter`)
  }

  return (...args: any) => {
    if (!called) {
      func(...args)
      called = true
    }
  }
}

const warnInterpolate = once(console.warn)
export function deprecateInterpolate() {
  warnInterpolate(
    `${prefix}The "interpolate" function is deprecated in v9 (use "to" instead)`
  )
}

const warnDirectCall = once(console.warn)
export function deprecateDirectCall() {
  warnDirectCall(
    `${prefix}Directly calling start instead of using the api object is deprecated in v9 (use ".start" instead), this will be removed in later 0.X.0 versions`
  )
}
