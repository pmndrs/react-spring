// Important note: start() and stop() will only be called at most once.
// Once an animation has been stopped or finished its course, it will
// not be reused.
export default class Animation {
  start(fromValue, onUpdate, onEnd, previousAnimation) {}

  stop() {}

  // Helper function for subclasses to make sure onEnd is only called once.
  __debouncedOnEnd(result) {
    const onEnd = this.__onEnd
    this.__onEnd = null
    onEnd && onEnd(result)
  }
}
