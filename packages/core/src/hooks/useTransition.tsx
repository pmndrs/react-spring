import React, { useRef, useMemo, useImperativeHandle, ReactNode } from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import {
  is,
  toArray,
  useForceUpdate,
  useOnce,
  each,
  OneOrMore,
  Falsy,
  RefProp,
  Merge,
  UnknownProps,
  Indexable,
} from 'shared'

import {
  SpringHandle,
  AsyncTo,
  FromProp,
  SpringValues,
  SpringConfig,
} from '../types/spring'
import { Valid, PickAnimated } from '../types/common'
import { AnimationProps, AnimationEvents } from '../types/animated'
import { DEFAULT_PROPS, callProp, inferTo } from '../helpers'
import {
  Controller,
  ControllerProps,
  getSprings,
  setSprings,
} from '../Controller'
import { UseSpringProps } from './useSpring'

/** This transition is being mounted */
const MOUNT = 'mount'
/** This transition is entering or has entered */
const ENTER = 'enter'
/** This transition had its animations updated */
const UPDATE = 'update'
/** This transition will expire after animating */
const LEAVE = 'leave'

// TODO: convert to "const enum" once Babel supports it
export type TransitionPhase =
  | typeof MOUNT
  | typeof ENTER
  | typeof UPDATE
  | typeof LEAVE

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
): [
  TransitionFn<Item, PickAnimated<Props>>,
  TransitionHandle['update'],
  TransitionHandle['stop']
]

export function useTransition(
  data: unknown,
  props: UseTransitionProps,
  deps?: any[]
) {
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
        clearTimeout(t.expirationId)
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

  const defaultProps = {} as UnknownProps
  each(DEFAULT_PROPS, prop => {
    if (/function|object/.test(typeof props[prop])) {
      defaultProps[prop] = props[prop]
    }
  })

  // Generate changes to apply in useEffect.
  const changes = new Map<TransitionState, Change>()
  each(transitions, (t, i) => {
    let to: any
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

    // The payload is used to update the spring props once the current render is committed.
    const payload: ControllerProps = {
      ...defaultProps,
      // When "to" is a function, it can return (1) an array of "useSpring" props,
      // (2) an async function, or (3) an object with any "useSpring" props.
      to: to = callProp(to, t.item, i),
      from: callProp(from, t.item, i),
      delay: delay += trail,
      config: callProp(props.config || (defaultProps.config as any), t.item, i),
      ...(is.obj(to) && inferTo(to)),
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

  const api = useMemo(
    (): TransitionHandle => ({
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
      pause: keys => each(usedTransitions.current!, t => t.ctrl.pause(keys)),
      resume: keys => each(usedTransitions.current!, t => t.ctrl.resume(keys)),
    }),
    []
  )

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

  const renderTransitions: TransitionFn = render =>
    transitions.map((t, i) => {
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
    })

  return arguments.length == 3
    ? ([renderTransitions, api.update, api.stop] as const)
    : renderTransitions
}

export type UseTransitionProps<Item = any> = Merge<
  AnimationProps & AnimationEvents,
  {
    from?: TransitionFrom<Item>
    initial?: TransitionFrom<Item>
    enter?: TransitionTo<Item>
    update?: TransitionTo<Item>
    leave?: TransitionTo<Item>
    key?: ItemKeys<Item>
    sort?: (a: Item, b: Item) => number
    trail?: number
    /**
     * When `true` or `<= 0`, each item is unmounted immediately after its
     * `leave` animation is finished.
     *
     * When `false`, items are never unmounted.
     *
     * When `> 0`, this prop is used in a `setTimeout` call that forces a
     * rerender if the component that called `useTransition` doesn't rerender
     * on its own after an item's `leave` animation is finished.
     */
    expires?: boolean | number | ((item: Item) => boolean | number)
    config?:
      | SpringConfig
      | ((item: Item, index: number) => AnimationProps['config'])
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined.
     */
    ref?: RefProp<TransitionHandle>
  }
>

export type ItemKeys<T = any> = OneOrMore<Key> | ((item: T) => Key) | null

/** Control the transition springs without re-rendering. */
export type TransitionHandle<State extends Indexable = UnknownProps> = Merge<
  SpringHandle<State>,
  {
    update: (
      props:
        | OneOrMore<ControllerProps<State>>
        | ((index: number, ctrl: Controller<State>) => ControllerProps<State>)
    ) => TransitionHandle<State>
  }
>

/** The function returned by `useTransition` */
export interface TransitionFn<Item = any, State extends object = any> {
  (
    render: (
      values: SpringValues<State>,
      item: Item,
      transition: TransitionState<Item>,
      index: number
    ) => ReactNode
  ): ReactNode[]
}

export interface TransitionState<Item = any> {
  key: any
  item: Item
  ctrl: Controller
  phase: TransitionPhase
  expired?: boolean
  expirationId?: number
}

//
// Internal
//

type Key = string | number

type TransitionFrom<Item> =
  | FromProp<UnknownProps>
  | ((item: Item, index: number) => FromProp<UnknownProps>)

type TransitionTo<Item> =
  | Falsy
  | OneOrMore<UseSpringProps<UnknownProps>>
  | ((
      item: Item,
      index: number
    ) => UseSpringProps<UnknownProps> | AsyncTo<UnknownProps> | Falsy)

interface Change {
  phase: TransitionPhase
  springs: SpringValues<UnknownProps>
  payload: ControllerProps
}

function getKeys(
  items: readonly any[],
  { key, keys = key }: { key?: ItemKeys; keys?: ItemKeys }
): readonly any[] {
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys)
}
