import React, { useRef, useMemo, useImperativeHandle } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import {
  is,
  toArray,
  useForceUpdate,
  useOnce,
  each,
  OneOrMore,
  UnknownProps,
} from 'shared'

import {
  Change,
  ControllerUpdate,
  ItemKeys,
  PickAnimated,
  SpringStartFn,
  SpringStopFn,
  TransitionFn,
  TransitionState,
  TransitionTo,
  UseTransitionProps,
  TransitionDefaultProps,
} from '../types'
import { Valid } from '../types/common'
import { callProp, inferTo, mergeDefaultProps } from '../helpers'
import { Controller, getSprings, setSprings } from '../Controller'
import { SpringHandle } from '../SpringHandle'
import {
  ENTER,
  MOUNT,
  LEAVE,
  UPDATE,
  TransitionPhase,
} from '../TransitionPhase'

declare function setTimeout(handler: Function, timeout?: number): number
declare function clearTimeout(timeoutId: number): void

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
  ? [
      TransitionFn<Item, State & object>,
      SpringStartFn<State>,
      SpringStopFn<State>
    ]
  : never

export function useTransition(
  data: unknown,
  props: UseTransitionProps,
  deps?: any[]
): any {
  const { ref, reset, sort, trail = 0, expires = true } = props

  // Every item has its own transition.
  const items = toArray(data)
  const transitions: TransitionState[] = []

  // Keys help with reusing transitions between renders.
  // The `key` prop can be undefined (which means the items themselves are used
  // as keys), or a function (which maps each item to its key), or an array of
  // keys (which are assigned to each item by index).
  const keys = getKeys(items, props)

  // The "onRest" callbacks need a ref to the latest transitions.
  const usedTransitions = useRef<TransitionState[] | null>(null)
  const prevTransitions = usedTransitions.current
  useLayoutEffect(() => {
    usedTransitions.current = transitions
  })

  // Destroy all transitions on dismount.
  useOnce(() => () =>
    each(usedTransitions.current!, t => {
      if (t.expired) {
        clearTimeout(t.expirationId!)
      }
      t.ctrl.dispose()
    })
  )

  // Map old indices to new indices.
  const reused: number[] = []
  if (prevTransitions && !reset)
    each(prevTransitions, (t, i) => {
      // Expired transitions are not rendered.
      if (t.expired) {
        clearTimeout(t.expirationId!)
      } else {
        i = reused[i] = keys.indexOf(t.key)
        if (~i) transitions[i] = t
      }
    })

  // Mount new items with fresh transitions.
  each(items, (item, i) => {
    transitions[i] ||
      (transitions[i] = {
        key: keys[i],
        item,
        phase: MOUNT,
        ctrl: new Controller(),
      })
  })

  // Update the item of any transition whose key still exists,
  // and ensure leaving transitions are rendered until they finish.
  if (reused.length) {
    let i = -1
    each(reused, (keyIndex, prevIndex) => {
      const t = prevTransitions![prevIndex]
      if (~keyIndex) {
        i = transitions.indexOf(t)
        transitions[i] = { ...t, item: items[keyIndex] }
      } else if (props.leave) {
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

  const defaultProps = {} as TransitionDefaultProps
  mergeDefaultProps(defaultProps, props)

  // Generate changes to apply in useEffect.
  const changes = new Map<TransitionState, Change>()
  each(transitions, (t, i) => {
    let to: TransitionTo<any>
    let from: any
    let phase: TransitionPhase
    if (t.phase == MOUNT) {
      to = props.enter
      phase = ENTER
      // The "initial" prop is only used on first render. It always overrides
      // the "from" prop when defined, and it makes "enter" instant when null.
      from = props.initial
      if (is.und(from) || (prevTransitions && !reset)) {
        from = props.from
      }
    } else {
      const isLeave = keys.indexOf(t.key) < 0
      if (t.phase != LEAVE) {
        if (isLeave) {
          to = props.leave
          phase = LEAVE
        } else if ((to = props.update)) {
          phase = UPDATE
        } else return
      } else if (!isLeave) {
        to = props.enter
        phase = ENTER
      } else return
    }

    // When "to" is a function, it can return (1) an array of "useSpring" props,
    // (2) an async function, or (3) an object with any "useSpring" props.
    to = is.obj(to) ? inferTo(to) : { to: callProp(to, t.item, i) }

    if (!to.config) {
      const config = props.config || defaultProps.config
      to.config = callProp(config, t.item, i)
    }

    // The payload is used to update the spring props once the current render is committed.
    const payload: ControllerUpdate<UnknownProps> = {
      ...defaultProps,
      from: callProp(from, t.item, i),
      delay: delay += trail,
      ...(to as any),
    }

    const { onRest } = payload
    payload.onRest = result => {
      if (is.fun(onRest)) {
        onRest(result)
      }
      if (t.ctrl.idle) {
        const transitions = usedTransitions.current!
        const idle = transitions.every(t => t.ctrl.idle)
        if (t.phase == LEAVE) {
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

  const api = useMemo(() => {
    return SpringHandle.create(() => {
      return usedTransitions.current!.map(t => t.ctrl)
    })
  }, [])

  useImperativeHandle(ref, () => api)

  useLayoutEffect(
    () => {
      each(changes, ({ phase, springs, payload }, t) => {
        t.phase = phase
        setSprings(t.ctrl, springs)
        if (ref) t.ctrl.update(payload)
        else t.ctrl.start(payload)
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

  return arguments.length == 3
    ? [renderTransitions, api.start, api.stop]
    : renderTransitions
}

function getKeys(
  items: readonly any[],
  { key, keys = key }: { key?: ItemKeys; keys?: ItemKeys }
): readonly any[] {
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys)
}
