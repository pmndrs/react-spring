export class Interpolation {
  static create(config) {
    return (...args) => config(...args)
  }
}

export let Bugfixes = undefined

export let ApplyAnimatedValues = undefined

export const injectApplyAnimatedValues = (fn, transform) => {
  ApplyAnimatedValues = { fn, transform }
}

export const injectBugfixes = fn => {
  Bugfixes = fn
}

export const injectInterpolation = cls => {
  Interpolation = cls
}
