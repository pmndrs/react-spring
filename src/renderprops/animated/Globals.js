export let bugfixes = undefined
export let applyAnimatedValues = undefined
export let colorNames = []
export let requestFrame = cb =>
  typeof window !== 'undefined' && window.requestAnimationFrame(cb)
export let cancelFrame = cb =>
  typeof window !== 'undefined' && window.cancelAnimationFrame(cb)
export let interpolation = undefined
export let now = () => Date.now()
export let defaultElement = undefined
export let createAnimatedStyle = undefined

export const injectApplyAnimatedValues = (fn, transform) =>
  (applyAnimatedValues = { fn, transform })
export const injectColorNames = names => (colorNames = names)
export const injectBugfixes = fn => (bugfixes = fn)
export const injectInterpolation = cls => (interpolation = cls)
export const injectFrame = (raf, caf) =>
  ([requestFrame, cancelFrame] = [raf, caf])
export const injectNow = nowFn => (now = nowFn)
export const injectDefaultElement = el => (defaultElement = el)
export const injectCreateAnimatedStyle = factory =>
  (createAnimatedStyle = factory)
