import Controller from './Controller'
import { shallowEqual } from '../shared/helpers'
import { timingSafeEqual } from 'crypto'

export default class KeyframeController {
  frameId = 0

  constructor (props) {
    const { config, onRest, ref, ...initialProps } = props
    this.globalProps = (({
      native,
      // config,
      // onRest,
      onStart,
      onFrame,
      children,
      reset,
      reverse,
      force,
      immediate,
      impl,
      inject,
      delay,
      attach,
      destroyed,
      track,
      interpolateTo,
      autoStart
    }) => ({
      native,
      onStart,
      onFrame,
      children,
      inject,
      delay,
      destroyed,
      track
    }))(props)

    this.globalConfig = props.config
    this.globalOnRest = props.onRest
    this.ref = props.ref
    this.prevSlots = {}
    this.currSlots = null
    this.instance = new Controller({ ...initialProps, native: true })
  }

  get isActive () {
    return this.instance.isActive
  }

  next = (props, localFrameId, last = true, index = 0) => {
    this.last = last
    this.running = true

    // config passed to props can overwrite global config passed in
    // controller instantiation i.e. globalConfig

    const config = props.config
      ? config
      : Array.isArray(this.globalConfig)
        ? this.globalConfig[index]
        : this.globalConfig

    this.onFrameRest = props.onRest
    return new Promise(resolve => {
      this.instance.update(
        { ...this.globalProps, ...props, config },
        this.onEnd(this.onFrameRest, localFrameId, last, resolve)
      )
    })
  }

  start = onEnd => {
    this.globalOnEnd = onEnd
    if (this.currSlots && !shallowEqual(this.prevSlots, this.currSlots)) {
      const localFrameId = ++this.frameId
      if (Array.isArray(this.currSlots)) {
        let q = Promise.resolve()
        for (let i = 0; i < this.currSlots.length; i++) {
          let index = i
          let slot = this.currSlots[index]
          let last = index === this.currSlots.length - 1
          q = q.then(() => {
            return (
              localFrameId === this.frameId &&
              this.next(slot, localFrameId, last, index)
            )
          })
        }
      } else if (typeof this.currSlots === 'function') {
        let index = 0
        slots(
          // next
          (props, last = false) =>
            localFrameId === this.frameId &&
            this.next(props, localFrameId, last, index++),
          // cancel
          () =>
            Globals.requestFrame(
              () => this.instance.isActive && this.instance.stop()
            )
        )
      } else {
        this.next(this.currSlots, localFrameId)
      }
      this.prevSlots = this.currSlots
    }
  }

  stop = (finished = false) => {
    this.frameId++
    this.instance.isActive && this.instance.stop(finished)
  }

  onEnd = (onFrameRest, localFrameId, last, resolve) => {
    return args => {
      // console.log(this.frameId)
      if (localFrameId === this.frameId) {
        // resolve the previous keyframe withing the same Frame Id
        resolve()
        onFrameRest && onFrameRest(this.merged)
        last && this.globalOnEnd && this.globalOnEnd(args)
        if (args.finished) {
          last && this.globalOnRest && this.globalOnRest(this.merged)
        }
      }
    }
  }

  get merged () {
    return this.instance.merged
  }

  update = (slots, ...args) => {
    this.currSlots = slots
    !this.ref && this.start(...args)
  }

  getValues = () => {
    return this.instance.getValues()
  }
}
