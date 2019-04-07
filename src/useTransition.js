import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  useCallback,
} from 'react'
import Ctrl from './animated/Controller'
import {
  is,
  toArray,
  callProp,
  interpolateTo,
  useForceUpdate,
} from './shared/helpers'
import { requestFrame } from './animated/Globals'

/** API
 * const transitions = useTransition(items, itemKeys, { ... })
 * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
 */

let guid = 0

const ENTER = 'enter'
const LEAVE = 'leave'
const UPDATE = 'update'

const makeKeys = (items, keys) =>
  (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String)

const makeConfig = props => {
  let { items, keys = item => item, ...rest } = props
  items = toArray(is.und(items) ? null : items)
  return { items, keys: makeKeys(items, keys), ...rest }
}

export function useTransition(input, keyTransform, props) {
  const config = makeConfig({
    ...props,
    items: input,
    keys: keyTransform || (i => i),
  })
  const {
    lazy = false,
    unique = false,
    reset = false,
    from,
    enter,
    leave,
    update,
    onDestroyed,
    keys,
    items,
    onFrame,
    onRest,
    onStart,
    ref,
    ...extra
  } = config

  const forceUpdate = useForceUpdate()
  const mounted = useRef(false)
  const state = useRef({
    mounted: false,
    first: true,
    deleted: [],
    current: {},
    transitions: [],
    prevProps: emptyObj,
    paused: !!props.ref,
    instances: !mounted.current && new Map(),
    forceUpdate,
  })

  useImperativeHandle(props.ref, () => ({
    start: () =>
      Promise.all(
        Array.from(state.current.instances).map(
          ([, c]) => new Promise(r => c.start(r))
        )
      ),
    stop: finished =>
      Array.from(state.current.instances).forEach(([, c]) => c.stop(finished)),
    get controllers() {
      return Array.from(state.current.instances).map(([, c]) => c)
    },
  }))

  // Update state
  state.current = diffItems(state.current, config)
  if (state.current.changed) {
    // Update state
    state.current.transitions.forEach(transition => {
      const { phase, spring, key, item } = transition
      if (!state.current.instances.has(key))
        state.current.instances.set(key, new Ctrl())

      // Avoid calling `onStart` more than once per transition.
      let started = false

      // update the map object
      const ctrl = state.current.instances.get(key)
      const itemProps = {
        reset: reset && phase === ENTER,
        ...extra,
        ...spring,
        from: callProp(from, item),
        ref,
        onRest: values => {
          if (state.current.mounted) {
            if (transition.destroyed) {
              // If no ref is given delete destroyed items immediately
              if (!ref && !lazy) cleanUp(state, key)
              if (onDestroyed) onDestroyed(item)
            }

            // A transition comes to rest once all its springs conclude
            const curInstances = Array.from(state.current.instances)
            const active = curInstances.some(([, c]) => !c.idle)
            if (!active && (ref || lazy) && state.current.deleted.length > 0) {
              cleanUp(state)
            }
            if (onRest) {
              onRest(item, phase, values)
            }
          }
        },
        onFrame: onFrame && (values => onFrame(item, phase, values)),
        onStart:
          onStart &&
          (() => started || (started = (onStart(item, phase), true))),
      }

      // Update controller
      ctrl.update(itemProps)
      if (!state.current.paused) ctrl.start()
    })
  }

  useEffect(() => {
    state.current.mounted = mounted.current = true
    return () => {
      state.current.mounted = mounted.current = false
      Array.from(state.current.instances).map(([, c]) => c.destroy())
      state.current.instances.clear()
    }
  }, [])

  return state.current.transitions.map(({ item, phase, key }) => {
    return {
      item,
      key,
      phase,
      props: state.current.instances.get(key).getValues(),
    }
  })
}

function cleanUp({ current: state }, filterKey) {
  const { deleted } = state
  for (let { key } of deleted) {
    const filter = t => t.key !== key
    if (is.und(filterKey) || filterKey === key) {
      state.instances.delete(key)
      state.transitions = state.transitions.filter(filter)
      state.deleted = state.deleted.filter(filter)
    }
  }
  state.forceUpdate()
}

const emptyObj = Object.freeze({})

function diffItems({ first, current, deleted, prevProps, ...state }, props) {
  let {
    items,
    keys,
    initial,
    from,
    enter,
    leave,
    update,
    trail = 0,
    unique,
    config,
    order = [ENTER, LEAVE, UPDATE],
  } = props
  let { keys: _keys, items: _items } = makeConfig(prevProps)

  // Compare next keys with current keys
  let currentKeys = Object.keys(current)
  let currentSet = new Set(currentKeys)
  let nextSet = new Set(keys)
  let added = keys.filter(key => !currentSet.has(key))
  let removed = state.transitions
    .filter(t => !t.destroyed && !nextSet.has(t.originalKey))
    .map(t => t.originalKey)
  let updated = keys.filter(key => currentSet.has(key))
  let delay = -trail

  while (order.length) {
    const changeType = order.shift()
    switch (changeType) {
      case ENTER: {
        added.forEach((key, index) => {
          // In unique mode, remove fading out transitions if their key comes in again
          if (unique && deleted.find(d => d.originalKey === key)) {
            deleted = deleted.filter(t => t.originalKey !== key)
          }
          const keyIndex = keys.indexOf(key)
          const item = items[keyIndex]
          const phase = first && initial !== void 0 ? 'initial' : ENTER
          const enterProps = interpolateTo(
            callProp(enter, item, keyIndex) || emptyObj
          )
          current[key] = {
            phase,
            originalKey: key,
            key: unique ? String(key) : guid++,
            item,
            spring: {
              delay: is.und(enterProps.delay)
                ? (delay += trail)
                : enterProps.delay,
              config: enterProps.config || callProp(config, item, phase),
              from:
                callProp(first && !is.und(initial) ? initial : from, item) ||
                emptyObj,
              ...enterProps,
            },
          }
        })
        break
      }
      case LEAVE: {
        removed.forEach(key => {
          const keyIndex = _keys.indexOf(key)
          const item = _items[keyIndex]
          const phase = LEAVE
          const leaveProps = interpolateTo(
            callProp(leave, item, keyIndex) || emptyObj
          )
          deleted.unshift({
            ...current[key],
            phase,
            destroyed: true,
            left: _keys[Math.max(0, keyIndex - 1)],
            right: _keys[Math.min(_keys.length, keyIndex + 1)],
            spring: {
              delay: is.und(leaveProps.delay)
                ? (delay += trail)
                : leaveProps.delay,
              config: leaveProps.config || callProp(config, item, phase),
              ...leaveProps,
            },
          })
          delete current[key]
        })
        break
      }
      case UPDATE: {
        updated.forEach(key => {
          const keyIndex = keys.indexOf(key)
          const item = items[keyIndex]
          const phase = UPDATE
          const updateProps = interpolateTo(
            callProp(update, item, keyIndex) || emptyObj
          )
          current[key] = {
            ...current[key],
            phase,
            spring: {
              delay: is.und(updateProps.delay)
                ? (delay += trail)
                : updateProps.delay,
              config: updateProps.config || callProp(config, item, phase),
              ...updateProps,
            },
          }
        })
        break
      }
    }
  }
  let out = keys.map(key => current[key])

  // This tries to restore order for deleted items by finding their last known siblings
  // only using the left sibling to keep order placement consistent for all deleted items
  deleted.forEach(({ left, right, ...item }) => {
    let pos
    // Was it the element on the left, if yes, move there ...
    if ((pos = out.findIndex(t => t.originalKey === left)) !== -1) pos += 1
    // And if nothing else helps, move it to the start ¯\_(ツ)_/¯
    pos = Math.max(0, pos)
    out = [...out.slice(0, pos), item, ...out.slice(pos)]
  })

  return {
    ...state,
    first: first && !!added.length,
    changed: !!(added.length || removed.length || updated.length),
    transitions: out,
    current,
    deleted,
    prevProps: props,
  }
}
