declare const console: any

const prefix = 'react-spring: '

let flagInterpolate = false
export function deprecateInterpolate() {
  if (!flagInterpolate) {
    flagInterpolate = true
    console.warn(
      prefix +
        'The "interpolate" function is deprecated in v9 (use "to" instead)'
    )
  }
}
