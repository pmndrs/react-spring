import { useContext, useMemo, useRef } from 'react'
import { Lookup, Merge, OneOrMore, UnknownProps } from '@react-spring/types'
import {
  is,
  each,
  isEqual,
  toArray,
  useForceUpdate,
  useIsomorphicLayoutEffect,
  useOnce,
  usePrev,
} from '@react-spring/shared'

import {
  AnimationProps,
  ControllerProps,
  ControllerUpdate,
  PickAnimated,
  Presence,
  PresenceEntry,
  SpringValues,
  UsePresenceListProps,
  UsePresenceProps,
} from '../types'
import { EventfulProps } from '../types/common'
import type { EventKey } from '../types/internal'
import {
  callProp,
  detachRefs,
  getDefaultProps,
  hasProps,
  inferTo,
  replaceRef,
} from '../helpers'
import { Controller, getSprings } from '../Controller'
import { SpringContext } from '../SpringContext'
import { SpringRef } from '../SpringRef'
import type { SpringRef as SpringRefType } from '../SpringRef'
import {
  diffPresence,
  getKeys,
  PresenceChange,
  PresenceDiffEntry,
} from '../presenceDiff'

/**
 * Per-key event handlers are typed from the inferred state, the same way as
 * `useTransition` (see #2541 and `EventfulProps`).
 */
type PresenceListUpdate<Item, Props extends object> = EventfulProps<
  Props,
  Merge<
    UsePresenceListProps<Item>,
    Pick<ControllerProps<PickAnimated<NoInfer<Props>>, Item>, EventKey>
  >,
  UsePresenceListProps<Item>
>

type PresenceUpdate<Props extends object> = EventfulProps<
  Props,
  Merge<
    UsePresenceProps,
    Pick<ControllerProps<PickAnimated<NoInfer<Props>>, true>, EventKey>
  >,
  UsePresenceProps
>

/**
 * Animate items as they are added to and removed from a list. Removed items
 * stay in the returned entries until their `leave` animation has finished.
 *
 * ```jsx
 * const entries = usePresenceList(items, {
 *   keys: item => item.id,
 *   from: { opacity: 0 },
 *   enter: { opacity: 1 },
 *   leave: { opacity: 0 },
 * })
 * return entries.map(({ key, item, springs }) => (
 *   <animated.div key={key} style={springs}>{item.text}</animated.div>
 * ))
 * ```
 */
export function usePresenceList<Item, Props extends object>(
  data: OneOrMore<Item>,
  props: () => PresenceListUpdate<Item, Props>,
  deps?: readonly any[]
): PickAnimated<Props> extends infer State
  ? State extends Lookup
    ? [PresenceEntry<Item, State>[], SpringRefType<State>]
    : never
  : never

export function usePresenceList<Item, Props extends object>(
  data: OneOrMore<Item>,
  props: PresenceListUpdate<Item, Props>
): PresenceEntry<Item, PickAnimated<Props>>[]

export function usePresenceList<Item, Props extends object>(
  data: OneOrMore<Item>,
  props: PresenceListUpdate<Item, Props>,
  deps: readonly any[] | undefined
): PickAnimated<Props> extends infer State
  ? State extends Lookup
    ? [PresenceEntry<Item, State>[], SpringRefType<State>]
    : never
  : never

export function usePresenceList(
  data: unknown,
  props: UsePresenceListProps | (() => UsePresenceListProps),
  deps?: readonly any[]
): any {
  const { entries, ref } = useEntries(data, props, deps, arguments.length == 3)
  return ref ? [entries, ref] : entries
}

/**
 * Animate something in when `show` becomes true, and out when it becomes
 * false. Returns `null` once the `leave` animation has finished.
 *
 * ```jsx
 * const presence = usePresence(open, {
 *   from: { opacity: 0 },
 *   enter: { opacity: 1 },
 *   leave: { opacity: 0 },
 * })
 * return presence && <animated.div style={presence.springs} />
 * ```
 */
export function usePresence<Props extends object>(
  show: boolean,
  props: () => PresenceUpdate<Props>,
  deps?: readonly any[]
): PickAnimated<Props> extends infer State
  ? State extends Lookup
    ? [Presence<State> | null, SpringRefType<State>]
    : never
  : never

export function usePresence<Props extends object>(
  show: boolean,
  props: PresenceUpdate<Props>
): Presence<PickAnimated<Props>> | null

export function usePresence<Props extends object>(
  show: boolean,
  props: PresenceUpdate<Props>,
  deps: readonly any[] | undefined
): PickAnimated<Props> extends infer State
  ? State extends Lookup
    ? [Presence<State> | null, SpringRefType<State>]
    : never
  : never

export function usePresence(
  show: boolean,
  props: UsePresenceProps | (() => UsePresenceProps),
  deps?: readonly any[]
): any {
  const listProps = is.fun(props)
    ? () => ({ ...props(), keys: presenceKeys })
    : { ...props, keys: presenceKeys }

  const { entries, ref } = useEntries(
    show ? [true] : [],
    listProps,
    deps,
    arguments.length == 3
  )

  const entry = entries[0]
  const presence = entry ? { springs: entry.springs, phase: entry.phase } : null
  return ref ? [presence, ref] : presence
}

const presenceKeys = () => 0

interface Change {
  phase: PresenceChange
  ctrl: Controller
  payload: ControllerUpdate<UnknownProps>
  springs: SpringValues<UnknownProps>
  /** Held back by `mode: 'wait'`, so it starts even with an injected ref. */
  released: boolean
}

/** Add the trail offset to a `delay` that may be a function of the spring key. */
const addDelay = (delay: AnimationProps['delay'], offset: number) =>
  is.fun(delay) ? (key: string) => delay(key) + offset : (delay || 0) + offset

function useEntries(
  data: unknown,
  props: UsePresenceListProps | (() => UsePresenceListProps),
  deps: readonly any[] | undefined,
  hasDeps: boolean
) {
  const propsFn = is.fun(props) && props
  const p = propsFn ? propsFn() : props
  const {
    reset,
    sort,
    trail = 0,
    reverse = false,
    expires = true,
    mode = 'sync',
    ref: propsRef,
  } = p

  // Return a `SpringRef` if a props function or deps array was passed.
  const ref = useMemo(() => (propsFn || hasDeps ? SpringRef() : void 0), [])

  // The state of the last commit. `committed` is `null` until the first
  // commit, which is when `initial` is used instead of `from`.
  //
  // These are refs read during render rather than state because `update`
  // (without `deps`) and `reset` apply once per parent render, and only the
  // last commit can tell a new render apart from React re-running one. They
  // are only written in layout effects, so a render React throws away leaves
  // nothing behind.
  const committed = useRef<PresenceDiffEntry[] | null>(null)
  const ctrls = useRef(new Map<unknown, Controller>())
  const heldKeys = useRef(new Set<unknown>())
  const committedDeps = useRef<readonly any[] | undefined>(undefined)

  const forceUpdate = useForceUpdate()

  // Entering and leaving follow `data`; only `update` waits for `deps`.
  const depsChanged =
    !!reset ||
    !deps ||
    !committedDeps.current ||
    !isEqual(deps, committedDeps.current)

  const prev = reset ? null : committed.current
  const items = toArray(data)
  const { next, changes, held } = diffPresence(
    committed.current || [],
    items,
    getKeys(items, p.keys, prev),
    {
      hasLeave: !!p.leave,
      hasUpdate: !!p.update && depsChanged,
      mode,
      reset: !!reset,
      sort,
      expires,
    }
  )

  // Controllers are only stored on commit, so a render that is thrown away
  // leaves nothing behind.
  const nextCtrls = new Map<unknown, Controller>()
  each(next, ({ key, item }) => {
    let ctrl = ctrls.current.get(key)!
    if (changes.get(key) == 'mount') {
      ctrl = new Controller()
      ctrl.item = item
    }
    nextCtrls.set(key, ctrl)
  })

  const defaultProps = getDefaultProps<UsePresenceListProps>(p)

  const applied = new Map<unknown, Change>()
  let trailIndex = 0
  each(next, ({ key, item }, i) => {
    const phase = changes.get(key)
    if (!phase) return

    const ctrl = nextCtrls.get(key)!

    // When "to" is a function, it can return (1) an array of "useSpring" props,
    // (2) an async function, or (3) an object with any "useSpring" props.
    let to = callProp(
      phase == 'leave' ? p.leave : phase == 'update' ? p.update : p.enter,
      item,
      i
    )
    to = is.obj(to) ? inferTo(to) : { to }

    // With `reverse`, the last changing entry starts first.
    const step = trailIndex++
    const trailDelay = (reverse ? changes.size - 1 - step : step) * trail

    const payload: ControllerUpdate<UnknownProps> = {
      ...defaultProps,
      // `config` and `delay` are passed through, so a function is called
      // per spring key.
      config: p.config || defaultProps.config,
      ref: propsRef,
      immediate: p.immediate,
      // This prevents implied resets.
      reset: false,
      ...(to as any),
      delay: addDelay(is.und(to.delay) ? p.delay : to.delay, trailDelay),
    }

    if ((phase == 'mount' || phase == 'enter') && is.und(payload.from)) {
      const from = is.und(p.initial) || prev ? p.from : p.initial
      payload.from = callProp(from, item, i)
    }

    if (phase == 'leave') {
      const { onResolve } = payload
      payload.onResolve = (result, ...args) => {
        callProp(onResolve, result, ...args)
        const entry = committed.current?.find(e => e.key === key)
        if (result.cancelled || entry?.phase != 'leave' || !ctrl.idle) return
        entry.expired = true
        // Held-back items are waiting for this rerender even when leaving
        // entries are kept.
        if (expires || mode == 'wait') forceUpdate()
      }
    }

    // Springs are created during render so entering items have their `from`
    // values on the first paint.
    const springs = getSprings(ctrl, payload)
    applied.set(key, {
      phase,
      ctrl,
      payload,
      springs,
      released: phase == 'mount' && heldKeys.current.has(key),
    })
  })

  // The prop overrides from an ancestor.
  const context = useContext(SpringContext)
  const prevContext = usePrev(context)
  const hasContext = context !== prevContext && hasProps(context)

  useIsomorphicLayoutEffect(() => {
    if (hasContext) {
      each(nextCtrls, ctrl => {
        ctrl.start({ default: context })
      })
    }
  }, [context])

  useIsomorphicLayoutEffect(() => {
    each(ctrls.current, (ctrl, key) => {
      if (nextCtrls.get(key) !== ctrl) {
        detachRefs(ctrl, ref)
        ctrl.stop(true)
      }
    })
    // Handlers receive `ctrl.item`, so it follows swapped items.
    each(next, ({ key, item }) => {
      nextCtrls.get(key)!.item = item
    })
    ctrls.current = nextCtrls
    committed.current = next
    heldKeys.current = new Set(held)
    committedDeps.current = deps
  })

  useIsomorphicLayoutEffect(() => {
    each(applied, ({ phase, ctrl, payload, released }) => {
      // Attach the controller to our local ref.
      ref?.add(ctrl)

      if (phase == 'mount') {
        ctrl.start({ default: context })
      }

      // Update the injected ref if needed.
      replaceRef(ctrl, payload.ref)

      // When an injected ref exists, the update is postponed until the ref
      // has its `start` method called.
      if (ctrl.ref && !released) {
        ctrl.update(payload)
      } else {
        ctrl.start(payload)
      }
    })
  })

  // The controllers are kept for StrictMode's simulated remount, which
  // replays the effects above.
  useOnce(() => () => {
    each(ctrls.current, ctrl => {
      detachRefs(ctrl, ref)
      // Lets `replaceRef` reattach an injected ref on remount (#1890).
      ctrl.ref = undefined
      ctrl.stop(true)
    })
  })

  const entries: PresenceEntry[] = next.map(({ key, item, phase }) => {
    const change = applied.get(key)
    const ctrl = nextCtrls.get(key)!
    return {
      key: is.str(key) || is.num(key) ? key : ctrl.id,
      item,
      phase,
      springs: { ...(change ? change.springs : ctrl.springs) },
    }
  })

  return { entries, ref }
}
