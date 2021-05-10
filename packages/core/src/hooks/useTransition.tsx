import * as React from 'react'
import { useContext, useRef, useMemo } from 'react'
import { OneOrMore, UnknownProps } from '@react-spring/types'
import {
  is,
  toArray,
  useForceUpdate,
  useOnce,
  usePrev,
  each,
  useLayoutEffect,
} from '@react-spring/shared'

import {
  Change,
  ControllerUpdate,
  ItemKeys,
  PickAnimated,
  TransitionFn,
  TransitionState,
  TransitionTo,
  UseTransitionProps,
} from '../types'
import { Valid } from '../types/common'
import {
  callProp,
  detachRefs,
  getDefaultProps,
  hasProps,
  inferTo,
  replaceRef,
} from '../helpers'
import { Controller, getSprings, setSprings } from '../Controller'
import { SpringContext } from '../SpringContext'
import { SpringRef } from '../SpringRef'
import { TransitionPhase } from '../TransitionPhase'

declare function setTimeout(handler: Function, timeout?: number): number
declare function clearTimeout(timeoutId: number): void

export function useTransition<Item, Props extends object>(
  data: OneOrMore<Item>,
  props: () =>
    | UseTransitionProps<Item>
    | (Props & Valid<Props, UseTransitionProps<Item>>),
  deps?: any[]
): PickAnimated<Props> extends infer State
  ? [TransitionFn<Item, PickAnimated<Props>>, SpringRef<State>]
  : never

export function useTransition<Item, Props extends object>(
  data: OneOrMore<Item>,
  props:
    | UseTransitionProps<Item>
    | (Props & Valid<Props, UseTransitionProps<Item>>)
): TransitionFn<Item, PickAnimated<Props>>

export function useTransition<Item, Props extends object>(
  data: OneOrMore<Item>,
  props:
    | UseTransitionProps<Item>
    | (Props & Valid<Props, UseTransitionProps<Item>>),
  deps: any[] | undefined
): PickAnimated<Props> extends infer State
  ? [TransitionFn<Item, State>, SpringRef<State>]
  : never

export function useTransition(
  data: unknown,
  props: UseTransitionProps | (() => any),
  deps?: any[]
): any {
  const propsFn = is.fun(props) && props

  const {
    reset,
    sort,
    trail = 0,
    expires = true,
    onDestroyed,
    ref: propsRef,
    config: propsConfig,
  }: UseTransitionProps<any> = propsFn ? propsFn() : props

  // Return a `SpringRef` if a deps array was passed.
  const ref = useMemo(
    () => (propsFn || arguments.length == 3 ? new SpringRef() : void 0),
    []
  )

  // Every item has its own transition.
  const items = toArray(data)
  const transitions: TransitionState[] = []

  // The "onRest" callbacks need a ref to the latest transitions.
  const usedTransitions = useRef<TransitionState[] | null>(null)
  const prevTransitions = reset ? null : usedTransitions.current
  useLayoutEffect(() => {
    usedTransitions.current = transitions
  })

  // Destroy all transitions on dismount.
  useOnce(() => () =>
    each(usedTransitions.current!, t => {
      if (t.expired) {
        clearTimeout(t.expirationId!)
      }
      detachRefs(t.ctrl, ref)
      t.ctrl.stop(true)
    })
  )

  // Keys help with reusing transitions between renders.
  // The `key` prop can be undefined (which means the items themselves are used
  // as keys), or a function (which maps each item to its key), or an array of
  // keys (which are assigned to each item by index).
  const keys = getKeys(items, propsFn ? propsFn() : props, prevTransitions)

  // Expired transitions that need clean up.
  const expired = (reset && usedTransitions.current) || []
  useLayoutEffect(() =>
    each(expired, ({ ctrl, item, key }) => {
      detachRefs(ctrl, ref)
      callProp(onDestroyed, item, key)
    })
  )

  // Map old indices to new indices.
  const reused: number[] = []
  if (prevTransitions)
    each(prevTransitions, (t, i) => {
      // Expired transitions are not rendered.
      if (t.expired) {
        clearTimeout(t.expirationId!)
        expired.push(t)
      } else {
        i = reused[i] = keys.indexOf(t.key)
        if (~i) transitions[i] = t
      }
    })

  // Mount new items with fresh transitions.
  each(items, (item, i) => {
    if (!transitions[i]) {
      transitions[i] = {
        key: keys[i],
        item,
        phase: TransitionPhase.MOUNT,
        ctrl: new Controller(),
      }

      transitions[i].ctrl.item = item
    }
  })

  // Update the item of any transition whose key still exists,
  // and ensure leaving transitions are rendered until they finish.
  if (reused.length) {
    let i = -1
    const { leave }: UseTransitionProps<any> = propsFn ? propsFn() : props
    each(reused, (keyIndex, prevIndex) => {
      const t = prevTransitions![prevIndex]
      if (~keyIndex) {
        i = transitions.indexOf(t)
        transitions[i] = { ...t, item: items[keyIndex] }
      } else if (leave) {
        transitions.splice(++i, 0, t)
      }
    })
  }

  if (is.fun(sort)) {
    transitions.sort((a, b) => sort(a.item, b.item))
  }

  // Track cumulative delay for the "trail" prop.
  let delay = -trail

  // Expired transitions use this to dismount.
  const forceUpdate = useForceUpdate()

  // These props are inherited by every phase change.
  const defaultProps = getDefaultProps<UseTransitionProps>(props)
  // Generate changes to apply in useEffect.
  const changes = new Map<TransitionState, Change>()
  each(transitions, (t, i) => {
    const key = t.key
    const prevPhase = t.phase

    const p: UseTransitionProps<any> = propsFn ? propsFn() : props

    let to: TransitionTo<any>
    let phase: TransitionPhase
    if (prevPhase == TransitionPhase.MOUNT) {
      to = p.enter
      phase = TransitionPhase.ENTER
    } else {
      const isLeave = keys.indexOf(key) < 0
      if (prevPhase != TransitionPhase.LEAVE) {
        if (isLeave) {
          to = p.leave
          phase = TransitionPhase.LEAVE
        } else if ((to = p.update)) {
          phase = TransitionPhase.UPDATE
        } else return
      } else if (!isLeave) {
        to = p.enter
        phase = TransitionPhase.ENTER
      } else return
    }

    // When "to" is a function, it can return (1) an array of "useSpring" props,
    // (2) an async function, or (3) an object with any "useSpring" props.
    to = callProp(to, t.item, i)
    to = is.obj(to) ? inferTo(to) : { to }

    if (!to.config) {
      const config = propsConfig || defaultProps.config
      to.config = callProp(config, t.item, i, phase)
    }

    // The payload is used to update the spring props once the current render is committed.
    const payload: ControllerUpdate<UnknownProps> = {
      ...defaultProps,
      ref: propsRef,
      delay: (delay += trail),
      // This prevents implied resets.
      reset: false,
      // Merge any phase-specific props.
      ...(to as any),
    }

    if (phase == TransitionPhase.ENTER && is.und(payload.from)) {
      const p = propsFn ? propsFn() : props
      // The `initial` prop is used on the first render of our parent component,
      // as well as when `reset: true` is passed. It overrides the `from` prop
      // when defined, and it makes `enter` instant when null.
      const from = is.und(p.initial) || prevTransitions ? p.from : p.initial

      payload.from = callProp(from, t.item, i)
    }

    const { onResolve } = payload
    payload.onResolve = result => {
      callProp(onResolve, result)

      const transitions = usedTransitions.current!
      const t = transitions.find(t => t.key === key)
      if (!t) return

      // Reset the phase of a cancelled enter/leave transition, so it can
      // retry the animation on the next render.
      if (result.cancelled && t.phase != TransitionPhase.UPDATE) {
        /**
         * @legacy Reset the phase of a cancelled enter/leave transition, so it can
         * retry the animation on the next render.
         *
         * Note: leaving this here made the transitioned item respawn.
         */
        // t.phase = prevPhase
        return
      }

      if (t.ctrl.idle) {
        const idle = transitions.every(t => t.ctrl.idle)
        if (t.phase == TransitionPhase.LEAVE) {
          const expiry = callProp(expires, t.item)
          if (expiry !== false) {
            const expiryMs = expiry === true ? 0 : expiry
            t.expired = true

            // Force update once the expiration delay ends.
            if (!idle && expiryMs > 0) {
              // The maximum timeout is 2^31-1
              if (expiryMs <= 0x7fffffff)
                t.expirationId = setTimeout(forceUpdate, expiryMs)
              return
            }
          }
        }
        // Force update once idle and expired items exist.
        if (idle && transitions.some(t => t.expired)) {
          forceUpdate()
        }
      }
    }

    const springs = getSprings(t.ctrl, payload)
    changes.set(t, { phase, springs, payload })
  })

  // The prop overrides from an ancestor.
  const context = useContext(SpringContext)
  const prevContext = usePrev(context)
  const hasContext = context !== prevContext && hasProps(context)

  // Merge the context into each transition.
  useLayoutEffect(() => {
    if (hasContext)
      each(transitions, t => {
        t.ctrl.start({ default: context })
      })
  }, [context])

  useLayoutEffect(
    () => {
      each(changes, ({ phase, springs, payload }, t) => {
        const { ctrl } = t
        t.phase = phase

        // Save any springs created this render.
        setSprings(ctrl, springs)

        // Attach the controller to our local ref.
        ref?.add(ctrl)

        // Merge the context into new items.
        if (hasContext && phase == TransitionPhase.ENTER) {
          ctrl.start({ default: context })
        }

        if (payload) {
          // Update the injected ref if needed.
          replaceRef(ctrl, payload.ref)

          // When an injected ref exists, the update is postponed
          // until the ref has its `start` method called.
          if (ctrl.ref) {
            ctrl.update(payload)
          } else {
            ctrl.start(payload)
          }
        }
      })
    },
    reset ? void 0 : deps
  )

  const renderTransitions: TransitionFn = render => (
    <>
      {transitions.map((t, i) => {
        const { springs } = changes.get(t) || t.ctrl
        const elem: any = render({ ...springs }, t.item, t, i)
        return elem && elem.type ? (
          <elem.type
            {...elem.props}
            key={is.str(t.key) || is.num(t.key) ? t.key : t.ctrl.id}
            ref={elem.ref}
          />
        ) : (
          elem
        )
      })}
    </>
  )

  return ref ? [renderTransitions, ref] : renderTransitions
}

/** Local state for auto-generated item keys */
let nextKey = 1

function getKeys(
  items: readonly any[],
  { key, keys = key }: { key?: ItemKeys; keys?: ItemKeys },
  prevTransitions: TransitionState[] | null
): readonly any[] {
  if (keys === null) {
    const reused = new Set()
    return items.map(item => {
      const t =
        prevTransitions &&
        prevTransitions.find(
          t =>
            t.item === item &&
            t.phase !== TransitionPhase.LEAVE &&
            !reused.has(t)
        )
      if (t) {
        reused.add(t)
        return t.key
      }
      return nextKey++
    })
  }
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys)
}
