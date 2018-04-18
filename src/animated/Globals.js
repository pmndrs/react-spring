const Globals = {
  ApplyAnimatedValues: undefined,
  Bugfixes: undefined,
  Interpolation: class Interpolation {
    static create(config) {
      return (...args) => config(...args)
    }
  },
  injectApplyAnimatedValues: (fn, transform) =>
    (Globals.ApplyAnimatedValues = { fn, transform }),
  injectBugfixes: fn => (Globals.Bugfixes = fn),
  injectInterpolation: cls => (Globals.Interpolation = cls),
}

export default Globals
