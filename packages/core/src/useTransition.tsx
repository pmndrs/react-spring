import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  ReactNode,
  useMemo,
} from 'react'
import { is, toArray, useForceUpdate, useOnce, each, OneOrMore } from 'shared'
import { now } from 'shared/globals'

import { callProp, interpolateTo } from './helpers'
import { SpringHandle } from './types/spring'
import { Controller } from './Controller'

// TODO: convert to "const enum" once Babel supports it
type Phase = number
/** This transition is being mounted */
const MOUNT = 0
/** This transition is entering or has entered */
const ENTER = 1
/** This transition had its animations updated */
const UPDATE = 2
/** This transition will expire after animating */
const LEAVE = 3

export type UseTransitionProps<T> = { [key: string]: any | T } // TODO
export type ItemsProp<T> = ReadonlyArray<T> | T | null | undefined
export type ItemKeys<T> =
  | ((item: T) => string | number)
  | ReadonlyArray<string | number>
  | string
  | number
  | null

export function useTransition<T>(data: OneOrMore<T>, props: any, deps?: any) {
  const { key, ref, reset, sort, trail = 0, expires = Infinity } = props

  // Every item has its own transition.
  const items = toArray<unknown>(data)
  const transitions: Transition[] = []

  // Keys help with reusing transitions between renders.
  // The `key` prop can be undefined (which means the items themselves are used
  // as keys), or a function (which maps each item to its key), or an array of
  // keys (which are assigned to each item by index).
  const keys: any[] = is.und(key)
    ? items
    : is.fun(key)
    ? items.map(key)
    : toArray(key)

  // The "onRest" callbacks need a ref to the latest transitions.
  const usedTransitions = useRef<Transition[] | null>(null)
  const prevTransitions = usedTransitions.current
  useEffect(() => {
    usedTransitions.current = transitions
  })

  // Destroy all transitions on dismount.
  useOnce(() => () =>
    each(usedTransitions.current!, t => {
      if (t.expiresBy) clearTimeout(t.expirationId)
      t.ctrl.dispose()
    })
  )

  // Map old indices to new indices.
  const reused: number[] = []
  if (prevTransitions && !reset)
    each(prevTransitions, (t, i) => {
      // Expired transitions are not rendered.
      if (t.expiresBy) {
        clearTimeout(t.expirationId)
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

  // Generate changes to apply in useEffect.
  const changes = new Map<Transition<T>, Change>()
  each(transitions, (t, i) => {
    let to: any
    let from: any
    let phase: Phase
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
      if (t.phase < LEAVE) {
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

    // The payload is used to update the spring props once the current render is committed.
    const payload: any = {
      // When "to" is a function, it can return (1) an array of "useSpring" props,
      // (2) an async function, or (3) an object with any "useSpring" props.
      to: to = callProp(to, t.item, i),
      from: callProp(from, t.item, i),
      delay: delay += trail,
      config: callProp(props.config, t.item, i),
      ...(is.obj(to) && interpolateTo(to)),
    }

    const { onRest } = payload
    payload.onRest = (values: any) => {
      if (is.fun(onRest)) {
        onRest(values)
      }
      if (t.phase == LEAVE) {
        t.expiresBy = now() + expires
        if (expires <= 0) {
          forceUpdate()
        } else {
          // Postpone dismounts while other controllers are active.
          const transitions = usedTransitions.current!
          if (transitions.every(t => t.ctrl.idle)) {
            forceUpdate()
          } else if (expires < Infinity) {
            t.expirationId = setTimeout(forceUpdate, expires)
          }
        }
      }
    }

    const change: Change = { phase }
    changes.set(t, change)

    // To ensure all Animated nodes exist during render,
    // the payload must be applied immediately for new items.
    if (t.phase > MOUNT) {
      change.payload = payload
    } else {
      t.ctrl.update(payload)
    }
  })

  const api = useMemo(
    (): SpringHandle => ({
      get controllers() {
        return usedTransitions.current!.map(t => t.ctrl)
      },
      update(props) {
        each(usedTransitions.current!, (t, i) =>
          t.ctrl.update(
            is.fun(props) ? props(i, t.ctrl) : is.arr(props) ? props[i] : props
          )
        )
        return api
      },
      async start() {
        const transitions = usedTransitions.current!
        const results = await Promise.all(transitions.map(t => t.ctrl.start()))
        return {
          value: results.map(result => result.value),
          finished: results.every(result => result.finished),
        }
      },
      stop: keys => each(usedTransitions.current!, t => t.ctrl.stop(keys)),
    }),
    []
  )

  useImperativeHandle(ref, () => api)

  useEffect(
    () => {
      each(changes, ({ phase, payload }, t) => {
        t.phase = phase
        if (payload) t.ctrl.update(payload)
        if (!ref) t.ctrl.start()
      })
    },
    reset ? void 0 : deps
  )

  return (render: (props: any, item: T) => ReactNode) =>
    transitions.map(t => {
      const elem: any = render({ ...t.ctrl.springs }, t.item)
      return elem && elem.type ? (
        <elem.type
          {...elem.props}
          key={is.str(t.key) || is.num(t.key) ? t.key : t.ctrl.id}
          ref={elem.ref}
        />
      ) : (
        elem
      )
    })
}

interface Change {
  phase: Phase
  payload?: any
}

interface Transition<T = any> {
  key: any
  item: T
  ctrl: Controller
  phase: Phase
  /** Destroy no later than this date */
  expiresBy?: number
  expirationId?: number
}
