export let bugfixes = undefined
export let applyAnimatedValues = undefined
export let colorNames = []
export let requestFrame = cb => global.requestAnimationFrame(cb)
export let cancelFrame = cb => global.cancelAnimationFrame(cb)
export let interpolation = undefined
export let now = () => Date.now()
export let defaultElement = undefined

export const injectApplyAnimatedValues = (fn, transform) =>
  (applyAnimatedValues = { fn, transform })
export const injectColorNames = names => (colorNames = names)
export const injectBugfixes = fn => (bugfixes = fn)
export const injectInterpolation = cls => (interpolation = cls)
export const injectFrame = (raf, caf) =>
  ([requestFrame, cancelFrame] = [raf, caf])
export const injectNow = nowFn => (now = nowFn)
export const injectDefaultElement = el => (defaultElement = el)
