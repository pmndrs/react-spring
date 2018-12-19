import {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeMethods,
} from 'react'
import KeyframeController from '../animated/KeyframeController'
import { toArray, callProp, Queue } from '../shared/helpers'

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
  const startQueue = useRef({
    queue: !mounted.current && new Queue(),
    endResolver: () => null,
  })

  // Destroy controllers on unmount
  useEffect(() => () => instances.current.forEach(i => i.destroy()), [])

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

  // Prop changes effect
  useMemo(
    () => {
      startQueue.current.queue.clear()
      startQueue.current.endResolver = null
      const { transitions, ...rest } = calculateDiffInItems(state, props)

      transitions.forEach(
        ({ state: slot, to, config, trail, key, item, destroyed }) => {
          // when values are unique, clear out old controllers on enter
          // also stop if inactive so that on end is not called

          !instances.current.has(key) &&
            instances.current.set(
              key,
              new KeyframeController({
                ...from,
                ...(first.current && initial),
                config,
                delay: trail,
                native: true,
                ref,
              })
            )

          const instance = instances.current.get(key)
          const ctrl = instance

          if (slot === 'update' || slot !== activeSlots.current[key]) {
            // add the current running slot to the active slots ref so the same slot isnt re-applied
            activeSlots.current[key] = slot
            function onEnd({ finished }) {
              if (mounted.current && finished) {
                if (destroyed && onDestroyed) onDestroyed(item)
                // onRest needs to be called everytime each item
                // has finished, it is needed for notif hub to work.
                // we could have two seperate callback, one for each
                // and one for a sort of global on rest and peritem onrest?
                onRest && onRest(item, slot, ctrl.merged)
                // Only call onRest when all springs have come to rest
                if (![...instances.current.values()].some(v => v.isActive)) {
                  if (ref) {
                    startQueue.current.endResolver &&
                      startQueue.current.endResolver()
                    startQueue.current.endResolver = null
                  }

                  // update when all transitions is complete to clean dom of removed elements.
                  setState(state => ({
                    ...state,
                    deleted: [],
                    transitions: state.transitions.filter(
                      ({ destroyed }) => !destroyed
                    ),
                  }))
                }
              }
            }
            ctrl.config = config
            ctrl.update(to, onEnd)
            if (ref) {
              startQueue.current.queue.enqueue(() => ctrl.start(onEnd))
            }
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
    start: resolve => {
      startQueue.current.endResolver = resolve
      while (startQueue.current.queue.length) {
        const start = startQueue.current.queue.dequeue()
        start()
      }
    },
    stop: (finished, resolve) => {
      instances.current.forEach(ctrl => ctrl.isActive && ctrl.stop(finished))
      resolve && resolve()
    },
  }))

  return state.transitions.map(({ item, state, key }) => {
    return {
      item,
      key,
      state,
      props: instances.current.get(key).getValues(),
    }
  })
}
