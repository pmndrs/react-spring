export let bugfixes = undefined
export let applyAnimatedValues = undefined
export let colorNames = []
export let requestFrame = cb => global.requestAnimationFrame(cb)
export let cancelFrame = cb => global.cancelAnimationFrame(cb)
export let Interpolation = undefined

export const injectApplyAnimatedValues = (fn, transform) =>
  (applyAnimatedValues = { fn, transform })
export const injectColorNames = names => (colorNames = names)
export const injectBugfixes = fn => (bugfixes = fn)
export const injectInterpolation = cls => (Interpolation = cls)
export const injectFrame = (raf, caf) =>
  ([requestFrame, cancelFrame] = [raf, caf])
