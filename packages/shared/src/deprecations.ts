declare const console: any

const prefix = 'react-spring: '

let flagInterpolate = false
export function deprecateInterpolate() {
  if (!flagInterpolate) {
    flagInterpolate = true
    console.warn(prefix + 'interpolate() will be deprecated in v10, use .to()')
  }
}
