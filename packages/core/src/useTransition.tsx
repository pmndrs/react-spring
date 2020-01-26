import React, {
  useRef,
  useMemo,
  useImperativeHandle,
  ReactNode,
  RefObject,
} from 'react'
import { useLayoutEffect } from 'react-layout-effect'
import {
  is,
  toArray,
  useForceUpdate,
  useOnce,
  each,
  OneOrMore,
  Falsy,
  Merge,
  UnknownProps,
} from 'shared'
import { now } from 'shared/globals'

import {
  SpringHandle,
  AsyncTo,
  FromProp,
  SpringValues,
  SpringConfig,
} from './types/spring'
import { PickAnimated } from './types/common'
import { AnimationProps, AnimationEvents } from './types/animated'
import { DEFAULT_PROPS, callProp, inferTo } from './helpers'
import { Controller, ControllerProps } from './Controller'
import { UseSpringProps } from './useSpring'

// TODO: convert to "const enum" once Babel supports it
export type TransitionPhase = number & { t: 'TransitionPhase' }
/** This transition is being mounted */
const MOUNT = 0 as TransitionPhase
/** This transition is entering or has entered */
const ENTER = 1 as TransitionPhase
/** This transition had its animations updated */
const UPDATE = 2 as TransitionPhase
/** This transition will expire after animating */
const LEAVE = 3 as TransitionPhase

type PhaseProp<Item> =
  | Falsy
  | OneOrMore<UseSpringProps & UnknownProps>
  | ((
      item: Item,
      index: number
    ) => (UseSpringProps & UnknownProps) | AsyncTo<UnknownProps> | Falsy)

type PhaseProps<Item = any, From = {}> = {
  from?: From &
    (
      | FromProp<UnknownProps>
      | ((item: Item, index: number) => FromProp<UnknownProps>)
    )
  initial?: From &
    (
      | FromProp<UnknownProps>
      | ((item: Item, index: number) => FromProp<UnknownProps>)
    )
  enter?: PhaseProp<Item>
  update?: PhaseProp<Item>
  leave?: PhaseProp<Item>
}

type Key = string | number

export type ItemKeys<T = any> = OneOrMore<Key> | ((item: T) => Key) | null

export type UseTransitionProps<Item = any> = Merge<
  AnimationProps & AnimationEvents,
  {
    /**
     * Used to access the imperative API.
     *
     * Animations never auto-start when `ref` is defined.
     */
    ref?: RefObject<TransitionHandle>
    key?: ItemKeys<Item>
    sort?: (a: Item, b: Item) => number
    trail?: number
    expires?: number
    config?:
      | SpringConfig
      | ((item: Item, index: number) => AnimationProps['config'])
  }
>

/** The imperative `ref` API */
export type TransitionHandle = Merge<
  SpringHandle,
  {
    update(props: ControllerProps): TransitionHandle
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

function getKeys(
  items: readonly any[],
  { key, keys = key }: { key?: ItemKeys; keys?: ItemKeys }
): readonly any[] {
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys)
}

export function useTransition<Item, From, Props extends object>(
  data: OneOrMore<Item>,
  props: Props & PhaseProps<Item, From> & UseTransitionProps<Item>,
  deps?: any[]
): TransitionFn<Item, PickAnimated<Props>>

export function useTransition(
  data: unknown,
  props: PhaseProps & UseTransitionProps,
  deps?: any[]
): TransitionFn {
  const { ref, reset, sort, trail = 0, expires = Infinity } = props

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
      if (t.expiresBy != null) {
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
      if (t.expiresBy != null) {
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
      if (t.phase == LEAVE && t.ctrl.idle) {
        t.expiresBy = now() + expires
        if (expires <= 0) {
          forceUpdate()
        } else {
          // Postpone dismounts while other controllers are active.
          const transitions = usedTransitions.current!
          if (transitions.every(t => t.ctrl.idle)) {
            forceUpdate()
          }
          // When `expires` is infinite, postpone dismount until next render.
          else if (expires < Infinity) {
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
      each(changes, ({ phase, payload }, t) => {
        t.phase = phase
        if (payload) t.ctrl.update(payload)
        if (!ref) t.ctrl.start()
      })
    },
    reset ? void 0 : deps
  )

  return render =>
    transitions.map((t, i) => {
      const elem: any = render({ ...t.ctrl.springs }, t.item, t, i)
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
  phase: TransitionPhase
  payload?: any
}

export interface TransitionState<Item = any> {
  key: any
  item: Item
  ctrl: Controller
  phase: TransitionPhase
  /** Destroy no later than this date */
  expiresBy?: number
  expirationId?: number
}
