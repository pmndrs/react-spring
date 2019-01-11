import Controller from './Controller'
import { shallowEqual } from '../shared/helpers'
import { requestFrame } from '../animated/Globals'

export default class KeyframeController {
  frameId = 0
  constructor(props) {
    const { config, onRest, ...initialProps } = props
    this.globalProps = (({
      native,
      onStart,
      onFrame,
      children,
      reset,
      delay,
      destroyed,
    }) => ({
      native,
      onStart,
      reset,
      onFrame,
      children,
      delay,
      destroyed,
    }))(props)

    this.globalConfig = props.config
    this.globalOnRest = props.onRest
    this.ref = props.ref
    this.prevSlots = {}
    this.currSlots = null
    this.instance = new Controller({ ...initialProps, native: true })
  }

  get isActive() {
    return this.instance.isActive
  }

  set config(config) {
    this.globalConfig = config
  }

  set globals(props) {
    this.globalProps = { ...this.globalProps, ...props }
  }

  next = (props, localFrameId, last = true, index = 0) => {
    // this.last = last
    // this.running = true

    // config passed to props can overwrite global config passed in
    // controller instantiation i.e. globalConfig

    const config = props.config
      ? props.config
      : Array.isArray(this.globalConfig)
      ? this.globalConfig[index]
      : this.globalConfig
    this.onFrameRest = props.onRest
    return new Promise(resolve => {
      // if ref is passed to internal controller, then it ignore onEnd call back
      this.instance.update(
        { ...this.globalProps, ...props, config },
        this.onEnd(this.onFrameRest, localFrameId, last, resolve)
      )

      // start needs to be called here if ref is present to activate the anim
      if (this.ref) {
        this.instance.start(
          this.onEnd(this.onFrameRest, localFrameId, last, resolve)
        )
      }

      // hacky solution to force the parent to be updated any time
      // the child controller is reset
      this.instance.props.reset &&
        this.instance.props.native &&
        this.parentForceUpdate &&
        requestFrame(this.parentForceUpdate)
    })
  }

  start = onEnd => {
    this.globalOnEnd = onEnd
    if (this.currSlots) {
      const localFrameId = ++this.frameId
      if (Array.isArray(this.currSlots)) {
        let q = Promise.resolve()
        for (let i = 0; i < this.currSlots.length; i++) {
          let index = i
          let slot = this.currSlots[index]
          let last = index === this.currSlots.length - 1
          q = q.then(
            () =>
              localFrameId === this.frameId &&
              this.next(slot, localFrameId, last, index)
          )
        }
      } else if (typeof this.currSlots === 'function') {
        let index = 0
        this.currSlots(
          // next
          (props, last = false) =>
            localFrameId === this.frameId &&
            this.next(props, localFrameId, last, index++),
          // cancel
          () =>
            requestFrame(
              () => this.instance.isActive && this.instance.stop(true)
            )
        )
      } else this.next(this.currSlots, localFrameId)
      this.prevSlots = this.currSlots
      return new Promise(resolve => (this.keyFrameEndResolver = resolve))
    }
  }

  stop = (finished = false) => {
    ++this.frameId
    if (this.instance.isActive) this.instance.stop(finished)
  }

  onEnd = (onFrameRest, localFrameId, last, resolve) => args => {
    if (localFrameId === this.frameId) {
      if (resolve) resolve()
      if (onFrameRest) onFrameRest(this.merged)
      if (last && this.globalOnEnd) this.globalOnEnd(args)
      if (last && this.keyFrameEndResolver) this.keyFrameEndResolver()
      if (args.finished && last && this.globalOnRest) {
        this.globalOnRest(this.merged)
      }
    }
  }

  get merged() {
    return this.instance.merged
  }

  get props() {
    return this.instance.props
  }

  updateWithForceUpdate = (forceUpdate, ...args) => {
    // needed to forceUpdate when the controller is reset
    // for native controllers
    this.parentForceUpdate = forceUpdate
    this.update(...args)
  }
  update = args => {
    const isFnOrArray = typeof args === 'function' || Array.isArray(args)
    if (isFnOrArray) {
      this.currSlots = args
      !this.ref && this.start()
    } else {
      const { slots, ...rest } = args
      this.currSlots = slots
      !this.ref && this.start(...rest)
    }
  }
  getValues = () => this.instance.getValues()
  destroy = () => this.instance.destroy()
}
