import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
} from 'react'
import KeyframeController from '../animated/KeyframeController'
import { toArray, callProp } from '../shared/helpers'
import { requestFrame } from '../animated/Globals'

let guid = 0
let mapKeys = (items, keys) =>
  (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String)
let get = props => {
  let { items, keys = states => states, ...rest } = props
  items = toArray(items !== void 0 ? items : null)
  return { items, keys: mapKeys(items, keys), ...rest }
}

function calculateDiffInItems({ prevProps, ...state }, props) {
  const { keys: _keys } = get(prevProps || {})
  const { keys, items, unique, trail = 0, update, enter, leave, config } = get(
    props
  )
  const currSet = new Set(keys)
  const prevSet = new Set(_keys)
  let deleted = [...state.deleted]
  let current = { ...state.current }

  const removed = state.transitions.filter(
    ({ destroyed, originalKey }) => !destroyed && !currSet.has(originalKey)
  )

  const added = keys.filter(key => !prevSet.has(key))
  const updated = _keys.filter(key => currSet.has(key))

  // if n
  let delay = (!trail && props.delay) || 0

  // Make sure trailed transitions start at 0
  if (trail) delay -= trail

  added.forEach(key => {
    const keyIndex = keys.indexOf(key)
    const item = items[keyIndex]
    const state = 'enter'

    if (unique && deleted.find(d => d.originalKey === key)) {
      deleted = deleted.filter(t => t.originalKey !== key)
    }

    current[key] = {
      item,
      state,
      trail: (delay = delay + trail),
      key: unique ? String(key) : guid++,
      originalKey: key,
      destroyed: false,
      config: callProp(config, item, state),
      to: callProp(enter, item),
    }
  })

  removed.forEach(({ item, originalKey, ...rest }) => {
    const keyIndex = _keys.indexOf(originalKey)
    const state = 'leave'
    deleted.unshift({
      ...rest,
      originalKey,
      item,
      state,
      left: _keys[Math.max(0, keyIndex - 1)],
      destroyed: true,
      trail: (delay = delay + trail),
      config: callProp(config, item, state),
      to: callProp(leave, item),
    })
    delete current[item.originalKey]
  })

  updated.forEach(key => {
    const keyIndex = keys.indexOf(key)
    const item = items[keyIndex]
    const state = 'update'
    current[key] = {
      ...current[key],
      item,
      state,
      destroyed: false,
      trail: (delay = delay + trail),
      config: callProp(config, item, state),
      to: callProp(update, item),
    }
  })

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

  return { deleted, updated, current, transitions: out }
}

/**
 * @param {TransitionProps} props
 */
export function useTransition(props) {
  const {
    items,
    keys: _currentKeys,
    from,
    initial,
    onRest,
    onDestroyed,
    ref,
  } = get(props)

  const mounted = useRef(false)
  useEffect(
    () => ((mounted.current = true), () => (mounted.current = false)),
    []
  )

  const instances = useRef(!mounted.current && new Map([]))
  useEffect(
    () => () =>
      Array.from(instances.current).map(([key, { ctrl }]) => {
        ctrl.destroy()
        instances.current.delete(key)
      }),
    []
  )

  const [, forceUpdate] = useState()
  const state = useRef({
    first: false,
    activeSlots: {},
    deleted: [],
    current: {},
    transitions: [],
    prevProps: null,
  })

  // only to be used internally, must be bound to the instance obj to work
  function onEnd({ finished }) {
    const { item, key, destroyed, slot, ctrl } = this
    if (mounted.current && finished) {
      if (destroyed && onDestroyed) onDestroyed(item)
      // onRest needs to be called everytime each item
      // has finished, it is needed for notif hub to work.
      // we could have two seperate callback, one for each
      // and one for a sort of global on rest and peritem onrest?
      if (onRest) onRest(item, slot, ctrl.merged)

      // Clean up internal state when items unmount, this doesn't necessrily trigger a forceUpdate
      if (destroyed) {
        state.current = {
          ...state.current,
          deleted: state.current.deleted.filter(t => t.key !== key),
          transitions: state.current.transitions.filter(t => t.key !== key),
        }
      }

      // Only when everything's come to rest we enforce a complete dom clean-up
      const currentInstances = Array.from(instances.current)
      if (!currentInstances.some(([, { ctrl }]) => ctrl.isActive))
        requestFrame(() => forceUpdate())
    }
  }

  // Prop changes effect
  useMemo(
    () => {
      const { transitions, ...rest } = calculateDiffInItems(
        state.current,
        props
      )

      transitions.forEach(
        ({ state: slot, to, config, trail, key, item, destroyed }) => {
          !instances.current.has(key) &&
            instances.current.set(key, {
              ctrl: new KeyframeController({
                ...callProp(
                  state.current.first
                    ? initial !== void 0
                      ? initial || {}
                      : from
                    : from,
                  item
                ),
                config,
                delay: trail,
                native: true,
                ref,
              }),
              item,
              destroyed,
              slot,
              key,
            })

          // update the map object
          const instance = instances.current.get(key)
          instance.item = item
          instance.destroyed = destroyed
          instance.slot = slot
          const ctrl = instance.ctrl

          if (slot === 'update' || slot !== state.current.activeSlots[key]) {
            state.current.activeSlots[key] = slot

            // Set the controller if config has changed
            if (config) ctrl.config = config

            // update props that are not animated values
            ctrl.globals = { delay: trail }
            ctrl.update(to, onEnd.bind(instance))
          }
        }
      )

      state.current = {
        ...state.current,
        transitions,
        prevProps: props,
        first: true,
        ...rest,
      }
    },
    [items, mapKeys(items, _currentKeys).join('')]
  )

  useImperativeHandle(ref, () => ({
    start: () =>
      Promise.all(
        Array.from(instances.current).map(([, obj]) =>
          obj.ctrl.start(onEnd.bind(obj))
        )
      ),
    stop: (finished = false) => {
      Array.from(instances.current).forEach(
        ([, { ctrl }]) => ctrl.isActive && ctrl.stop(finished)
      )
    },
  }))

  return state.current.transitions.map(({ item, state, key }) => {
    return {
      item,
      key,
      state,
      props: instances.current.get(key).ctrl.getValues(),
    }
  })
}
