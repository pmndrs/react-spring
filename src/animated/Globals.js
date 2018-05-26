export let bugfixes = undefined
export let applyAnimatedValues = undefined
export let requestFrame = cb => global.requestAnimationFrame(cb)
export let cancelFrame = cb => global.cancelAnimationFrame(cb)
export class Interpolation {
  static create(config) {
    return (...args) => config(...args)
  }
}

export const injectApplyAnimatedValues = (fn, transform) =>
  (applyAnimatedValues = { fn, transform })
export const injectBugfixes = fn => (bugfixes = fn)
export const injectInterpolation = cls => (Interpolation = cls)
export const injectFrame = (raf, caf) =>
  ([requestFrame, cancelFrame] = [raf, caf])
