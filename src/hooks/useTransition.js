import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeMethods,
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

    if (unique && deleted.find(d => d.originalKey === key))
      deleted = deleted.filter(t => t.originalKey !== key)

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

  removed.forEach(({ item, ...rest }) => {
    const keyIndex = _keys.indexOf(item.originalKey)
    const state = 'leave'
    deleted.unshift({
      ...rest,
      item,
      state,
      left: _keys[Math.max(0, keyIndex - 1)],
      right: _keys[Math.min(_keys.length, keyIndex + 1)],
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

  let transitions = keys.map(key => current[key])

  // this is so the latest deleted item might find its position first
  // as older deleted items might reference later deleted items to their left or right
  deleted.forEach(({ left, right, ...item }) => {
    let pos
    // Was it the element on the left, if yes, move there ...
    if ((pos = transitions.findIndex(t => t.originalKey === left)) !== -1) {
      pos += 1
    }
    // Or how about the element on the right ...
    if (pos === -1) pos = transitions.findIndex(t => t.originalKey === right)
    // And if nothing else helps, move it to the start ¯\_(ツ)_/¯
    pos = Math.max(0, pos)
    transitions = [
      ...transitions.slice(0, pos),
      item,
      ...transitions.slice(pos),
    ]
  })

  return { deleted, updated, current, transitions }
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
  const instances = useRef(!mounted.current && new Map([]))

  // Destroy controllers on unmount
  useEffect(
    () => () =>
      Array.from(instances.current).map(([key, { ctrl }]) => {
        ctrl.destroy()
        instances.current.delete(key)
      }),
    []
  )

  const first = useRef(true)
  const activeSlots = useRef({})
  const [state, setState] = useState({
    deleted: [],
    current: {},
    transitions: [],
    prevProps: null,
  })

  useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  }, [])

  // only to be used internally, must be bound to the instance obj to work
  function onEnd({ finished }) {
    const { item, destroyed, slot, ctrl } = this
    if (mounted.current && finished) {
      if (destroyed && onDestroyed) onDestroyed(item)
      // onRest needs to be called everytime each item
      // has finished, it is needed for notif hub to work.
      // we could have two seperate callback, one for each
      // and one for a sort of global on rest and peritem onrest?
      if (onRest) onRest(item, slot, ctrl.merged)

      if (
        !Array.from(instances.current).some(([, { ctrl }]) => ctrl.isActive)
      ) {
        // update when all transitions is complete to clean dom of removed elements.
        state.transitions.some(({ destroyed }) => destroyed) &&
          requestFrame(() =>
            setState(state => ({
              ...state,
              deleted: [],
              transitions: state.transitions.filter(
                ({ destroyed }) => !destroyed
              ),
            }))
          )
      }
    }
  }

  // Prop changes effect
  useMemo(
    () => {
      const { transitions, ...rest } = calculateDiffInItems(state, props)

      transitions.forEach(
        ({ state: slot, to, config, trail, key, item, destroyed }) => {
          !instances.current.has(key) &&
            instances.current.set(key, {
              ctrl: new KeyframeController({
                ...from,
                ...(first.current && initial),
                config,
                delay: trail,
                native: true,
                ref,
              }),
              item,
              destroyed,
              slot,
            })

          // update the map object
          const instance = instances.current.get(key)
          instance.item = item
          instance.destroyed = destroyed
          instance.slot = slot
          const ctrl = instance.ctrl

          if (slot === 'update' || slot !== activeSlots.current[key]) {
            activeSlots.current[key] = slot
            const cb = onEnd.bind(instance)
            // Set the controller if config has changed
            if (config) ctrl.config = config
            ctrl.update(to, cb)
          }
        }
      )

      first.current = false
      setState(state => ({
        ...state,
        transitions,
        prevProps: props,
        ...rest,
      }))
    },
    [mapKeys(items, _currentKeys).join('')]
  )

  useImperativeMethods(ref, () => ({
    start: () =>
      Promise.all(
        Array.from(instances.current).map(([, obj]) =>
          obj.ctrl.start(onEnd.bind(obj))
        )
      ),
    stop: (finished, resolve) => {
      Array.from(instances.current).forEach(
        ([, { ctrl }]) => ctrl.isActive && ctrl.stop(finished)
      )
      if (resolve) resolve()
    },
  }))

  return state.transitions.map(({ item, state, key }) => {
    return {
      item,
      key,
      state,
      props: instances.current.get(key).ctrl.getValues(),
    }
  })
}
