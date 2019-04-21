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
  reconcileDeleted,
} from './shared/helpers'
import { requestFrame } from './animated/Globals'

/** API
 * const transitions = useTransition(items, itemKeys, { ... })
 * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
 */

let guid = 0

const INITIAL = 'initial'
const ENTER = 'enter'
const UPDATE = 'update'
const LEAVE = 'leave'

const makeKeys = (items, keys) =>
  (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String)

const makeConfig = props => {
  let { items, keys, ...rest } = props
  items = toArray(is.und(items) ? null : items)
  return { items, keys: makeKeys(items, keys), ...rest }
}

export function useTransition(input, keyTransform, props) {
  props = makeConfig({
    ...props,
    items: input,
    keys: keyTransform || (i => i),
  })
  const {
    lazy = false,
    unique = false,
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
  } = props

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
      const { phase, key, item, props } = transition
      if (!state.current.instances.has(key))
        state.current.instances.set(key, new Ctrl())

      // Avoid calling `onStart` more than once per transition.
      let started = false

      // update the map object
      const ctrl = state.current.instances.get(key)
      const itemProps = {
        ...extra,
        ...props,
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
          (animation =>
            started || (started = (onStart(item, phase, animation), true))),
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
      props: state.current.instances.get(key).animated,
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

  if (props.reset) {
    current = {}
    state.transitions = []
  }

  // Compare next keys with current keys
  const currentKeys = Object.keys(current)
  const currentSet = new Set(currentKeys)
  const nextSet = new Set(keys)

  const addedKeys = keys.filter(key => !currentSet.has(key))
  const updatedKeys = update ? keys.filter(key => currentSet.has(key)) : []
  const deletedKeys = state.transitions
    .filter(t => !t.destroyed && !nextSet.has(t.originalKey))
    .map(t => t.originalKey)

  let delay = -trail

  while (order.length) {
    let phase = order.shift()
    if (phase === ENTER) {
      if (first && !is.und(initial)) {
        phase = INITIAL
        from = initial
      }
      addedKeys.forEach(key => {
        // In unique mode, remove fading out transitions if their key comes in again
        if (unique && deleted.find(d => d.originalKey === key)) {
          deleted = deleted.filter(t => t.originalKey !== key)
        }
        const i = keys.indexOf(key)
        const item = items[i]
        const enterProps = callProp(enter, item, i)
        current[key] = {
          phase,
          originalKey: key,
          key: unique ? String(key) : guid++,
          item,
          props: {
            delay: (delay += trail),
            config: callProp(config, item, phase),
            from: callProp(from, item),
            to: enterProps,
            ...(is.obj(enterProps) && interpolateTo(enterProps)),
          },
        }
      })
    } else if (phase === LEAVE) {
      deletedKeys.forEach(key => {
        const i = _keys.indexOf(key)
        const item = _items[i]
        const leaveProps = callProp(leave, item, i)
        deleted.push({
          ...current[key],
          phase,
          destroyed: true,
          left: _keys[i - 1],
          right: _keys[i + 1],
          props: {
            delay: (delay += trail),
            config: callProp(config, item, phase),
            to: leaveProps,
            ...(is.obj(leaveProps) && interpolateTo(leaveProps)),
          },
        })
        delete current[key]
      })
    } else if (phase === UPDATE) {
      updatedKeys.forEach(key => {
        const i = keys.indexOf(key)
        const item = items[i]
        const updateProps = callProp(update, item, i)
        current[key] = {
          ...current[key],
          phase,
          props: {
            delay: (delay += trail),
            config: callProp(config, item, phase),
            to: updateProps,
            ...(is.obj(updateProps) && interpolateTo(updateProps)),
          },
        }
      })
    }
  }
  let out = keys.map(key => current[key])
  out = reconcileDeleted(deleted, out)

  return {
    ...state,
    first: first && !addedKeys.length,
    changed: !!(addedKeys.length || deletedKeys.length || updatedKeys.length),
    transitions: out,
    current,
    deleted,
    prevProps: props,
  }
}
