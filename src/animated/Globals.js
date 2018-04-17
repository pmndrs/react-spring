const Globals = {
  ApplyAnimatedValues: undefined,
  Bugfixes: undefined,
  injectApplyAnimatedValues: (fn, transform) =>
    (Globals.ApplyAnimatedValues = { fn, transform }),
  injectBugfixes: fn => (Globals.Bugfixes = fn),
}

export default Globals
