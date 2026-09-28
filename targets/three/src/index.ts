import { applyProps, addEffect, invalidate } from '@react-three/fiber'

import * as core from '@react-spring/core'
import { Globals } from '@react-spring/core'
import {
  createStringInterpolator,
  colors,
  createClock,
  withClock,
} from '@react-spring/shared'
import { createHost } from '@react-spring/animated'
import type { Lookup } from '@react-spring/types'

import { primitives } from './primitives'
import { WithAnimated } from './animated'

// Springs from this package follow React Three Fiber's frames (its loop, XR
// frames and manual `advance()` calls), on a clock of their own so they never
// stall springs from `@react-spring/web`.
const r3fClock = createClock()

// With `frameloop="demand"`, r3f only runs its loop while frames are requested
// via `invalidate()`. rafz signals (via `onDemand`) whenever it has frame work
// pending — including the microtask gaps between looped/sequenced segments,
// where the spring is momentarily idle. We defer the `invalidate()` to a
// microtask: calling it from within `addEffect` (r3f's "before" phase) would
// only set the frame count to 1, which r3f's same-frame `update()` decrements
// back to 0. Deferring lets it land once the loop has stopped, cleanly
// restarting it. One request per frame is enough, so we dedupe.
let frameRequested = false
const requestFrame = () => {
  if (frameRequested) return
  frameRequested = true
  Promise.resolve().then(() => {
    frameRequested = false
    invalidate()
  })
}

r3fClock.raf.frameLoop = 'demand'
r3fClock.raf.onDemand = requestFrame

// Let r3f drive the frameloop.
addEffect(() => {
  r3fClock.raf.advance()
})

Globals.assign({
  createStringInterpolator,
  colors,
})

const host = createHost(primitives, {
  applyAnimatedValues: applyProps,
  clock: r3fClock,
})

export const animated = host.animated as WithAnimated
export { animated as a }

// Marked pure so bundlers drop the hooks an app doesn't use.
const onR3fClock = <F extends (...args: any[]) => any>(fn: F) =>
  ((...args: Parameters<F>) => withClock(r3fClock, () => fn(...args))) as F

export const useSpring = /* @__PURE__ */ onR3fClock(core.useSpring)
export const useSprings = /* @__PURE__ */ onR3fClock(core.useSprings)
export const useTrail = /* @__PURE__ */ onR3fClock(core.useTrail)
export const useTransition = /* @__PURE__ */ onR3fClock(core.useTransition)
export const usePresence = /* @__PURE__ */ onR3fClock(core.usePresence)
export const usePresenceList = /* @__PURE__ */ onR3fClock(core.usePresenceList)
export const useSpringValue = /* @__PURE__ */ onR3fClock(core.useSpringValue)
export const useScroll = /* @__PURE__ */ onR3fClock(core.useScroll)
export const useResize = /* @__PURE__ */ onR3fClock(core.useResize)
export const useInView = /* @__PURE__ */ onR3fClock(core.useInView)
export const Spring = /* @__PURE__ */ onR3fClock(core.Spring)
export const Trail = /* @__PURE__ */ onR3fClock(core.Trail)
export const Transition = /* @__PURE__ */ onR3fClock(core.Transition)

// `clock` is a getter, not a static field: the build lowers static fields to
// assignments after the class, which keeps unused classes in every bundle.
//
// Hooks create core instances, so `instanceof` against these classes checks
// core's class instead. Subclasses keep the normal prototype check.
export class SpringValue<T = any> extends core.SpringValue<T> {
  /** @internal */
  static get clock() {
    return r3fClock
  }
  static [Symbol.hasInstance](value: unknown): boolean {
    return this === SpringValue
      ? value instanceof core.SpringValue
      : Function.prototype[Symbol.hasInstance].call(this, value)
  }
}

export class Controller<
  State extends Lookup = Lookup,
> extends core.Controller<State> {
  /** @internal */
  static get clock() {
    return r3fClock
  }
  static [Symbol.hasInstance](value: unknown): boolean {
    return this === Controller
      ? value instanceof core.Controller
      : Function.prototype[Symbol.hasInstance].call(this, value)
  }
}

export * from './animated'
export * from '@react-spring/core'
