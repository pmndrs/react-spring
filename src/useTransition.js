import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  useCallback,
} from 'react'
import Ctrl from './animated/Controller'
import { is, toArray, callProp, useForceUpdate } from './shared/helpers'
import { requestFrame } from './animated/Globals'

/** API
 * const transitions = useTransition(items, itemKeys, { ... })
 * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
 */

let guid = 0

const ENTER = 'enter'
const LEAVE = 'leave'
const UPDATE = 'update'
const mapKeys = (items, keys) =>
  (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String)
const get = props => {
  let { items, keys = item => item, ...rest } = props
  items = toArray(items !== void 0 ? items : null)
  return { items, keys: mapKeys(items, keys), ...rest }
}

export function useTransition(input, keyTransform, config) {
  const props = { items: input, keys: keyTransform || (i => i), ...config }
  const {
    lazy = false,
    unique = false,
    reset = false,
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
  } = get(props)

  const forceUpdate = useForceUpdate()
  const mounted = useRef(false)
  const state = useRef({
    mounted: false,
    first: true,
    deleted: [],
    current: {},
    transitions: [],
    prevProps: {},
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
  state.current = diffItems(state.current, props)
  if (state.current.changed) {
    // Update state
    state.current.transitions.forEach(transition => {
      const { slot, from, to, config, trail, key, item } = transition
      if (!state.current.instances.has(key))
        state.current.instances.set(key, new Ctrl())

      // update the map object
      const ctrl = state.current.instances.get(key)
      const newProps = {
        ...extra,
        to,
        from,
        config,
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
            if (!active && (ref || lazy) && state.current.deleted.length > 0)
              cleanUp(state)
            if (onRest) onRest(item, slot, values)
          }
        },
        onStart: onStart && (() => onStart(item, slot)),
        onFrame: onFrame && (values => onFrame(item, slot, values)),
        delay: trail,
        reset: reset && slot === ENTER,
      }

      // Update controller
      ctrl.update(newProps)
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

  return state.current.transitions.map(({ item, slot, key }) => {
    return {
      item,
      key,
      state: slot,
      props: state.current.instances.get(key).getValues(),
    }
  })
}

function cleanUp(state, filterKey) {
  const deleted = state.current.deleted
  for (let { key } of deleted) {
    const filter = t => t.key !== key
    if (is.und(filterKey) || filterKey === key) {
      state.current.instances.delete(key)
      state.current.transitions = state.current.transitions.filter(filter)
      state.current.deleted = state.current.deleted.filter(filter)
    }
  }
  state.current.forceUpdate()
}

function diffItems({ first, prevProps, ...state }, props) {
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
  } = get(props)
  let { keys: _keys, items: _items } = get(prevProps)
  let current = { ...state.current }
  let deleted = [...state.deleted]

  // Compare next keys with current keys
  let currentKeys = Object.keys(current)
  let currentSet = new Set(currentKeys)
  let nextSet = new Set(keys)
  let added = keys.filter(item => !currentSet.has(item))
  let removed = state.transitions
    .filter(item => !item.destroyed && !nextSet.has(item.originalKey))
    .map(i => i.originalKey)
  let updated = keys.filter(item => currentSet.has(item))
  let delay = -trail

  while (order.length) {
    const changeType = order.shift()
    switch (changeType) {
      case ENTER: {
        added.forEach((key, index) => {
          // In unique mode, remove fading out transitions if their key comes in again
          if (unique && deleted.find(d => d.originalKey === key))
            deleted = deleted.filter(t => t.originalKey !== key)
          const keyIndex = keys.indexOf(key)
          const item = items[keyIndex]
          const slot = first && initial !== void 0 ? 'initial' : ENTER
          current[key] = {
            slot,
            originalKey: key,
            key: unique ? String(key) : guid++,
            item,
            trail: (delay = delay + trail),
            config: callProp(config, item, slot),
            from: callProp(
              first ? (initial !== void 0 ? initial || {} : from) : from,
              item
            ),
            to: callProp(enter, item),
          }
        })
        break
      }
      case LEAVE: {
        removed.forEach(key => {
          const keyIndex = _keys.indexOf(key)
          const item = _items[keyIndex]
          const slot = LEAVE
          deleted.unshift({
            ...current[key],
            slot,
            destroyed: true,
            trail: (delay = delay + trail),
            config: callProp(config, item, slot),
            to: callProp(leave, item),
          })
          delete current[key]
        })
        break
      }
      case UPDATE: {
        updated.forEach(key => {
          const keyIndex = keys.indexOf(key)
          const item = items[keyIndex]
          const slot = UPDATE
          current[key] = {
            ...current[key],
            item,
            slot,
            trail: (delay = delay + trail),
            config: callProp(config, item, slot),
            to: callProp(update, item),
          }
        })
        break
      }
    }
  }
  let out = [...keys.map(key => current[key]), ...deleted]
  out.sort((a, b) => {
    return _keys.indexOf(a.originalKey) - _keys.indexOf(b.originalKey)
  })

  return {
    ...state,
    changed: added.length || removed.length || updated.length,
    first: first && added.length === 0,
    transitions: out,
    current,
    deleted,
    prevProps: props,
  }
}
