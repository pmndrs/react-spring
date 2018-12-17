import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeMethods
} from 'react'
import Controller from '../animated/Controller'
import { memoizedParse, setNext, parseKeyframedUpdate } from './KeyframesHook'
import { toArray, callProp, Queue } from '../shared/helpers'

let guid = 0
let mapKeys = (items, keys) =>
  (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String)
let get = props => {
  let { items, keys = states => states, ...rest } = props
  items = toArray(items !== void 0 ? items : null)
  return { items, keys: mapKeys(items, keys), ...rest }
}

function calculateDiffInItems ({ prevProps, ...state }, props) {
  const { keys: _keys } = get(prevProps || {})
  const { keys, items, unique, trail, update, enter, leave, config } = get(
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

  let delay = props.delay || 0

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
      to: callProp(enter, item)
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
      to: callProp(leave, item)
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
      to: callProp(update, item)
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
      ...transitions.slice(pos)
    ]
  })

  return { deleted, updated, current, transitions }
}

/**
 * @param {TransitionProps} props
 */
export function useTransition (props) {
  const { items, keys: _currentKeys, from, initial, onRest, onDestroyed, ref } = get(
    props
  )

  const [, forceUpdate] = useState()
  const mounted = useRef(false)
  const instances = useRef(!mounted.current && new Map([]))
  const startQueue = useRef({
    queue: !mounted.current && new Queue(),
    endResolver: () => null
  })

  // const memoizedParse = React.useMemo(() => parseKeyframedUpdate(), [])
  const destroyedRef = useRef([])
  const first = useRef(true)
  const activeSlots = useRef({})
  const state = useRef({
    deleted: [],
    current: {},
    transitions: [],
    prevProps: null
  })

  useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  }, [])

  // Prop changes effect
  useMemo(
    () => {
      const { transitions, ...rest } = calculateDiffInItems(
        state.current,
        props
      )
      transitions.forEach(
        ({ state: slot, to, config, trail, key, item, destroyed }) => {
          // when values are unique, clear out old controllers on enter
          // also stop if inactive so that on end is not called

          !instances.current.has(key) &&
            instances.current.set(key, {
              ctrl: new Controller({
                ...from,
                ...(first.current && initial),
                config,
                delay: trail
                // ref: ref && true
              }),
              resolve: { current: null },
              last: { current: true },
              ctrlKeyframeParser: parseKeyframedUpdate()
            })

          const instance = instances.current.get(key)
          const { ctrl, resolve, last, ctrlKeyframeParser } = instance

          if (slot === 'update' || slot !== activeSlots.current[key]) {
            // add the current running slot to the active slots ref so the same slot isnt re-applied
            activeSlots.current[key] = slot
            function onEnd ({ finished }) {
              resolve.current && resolve.current(ctrl.merged)
              if (last.current && mounted.current && finished) {
                if (destroyed && onDestroyed) onDestroyed(item)
                if (destroyed) destroyedRef.current.push(key)
                // onRest needs to be called everytime each item
                // has finished, it is needed for notif hub to work.
                // we could have two seperate callback, one for each
                // and one for a sort of global on rest and peritem onrest?
                onRest && onRest(item, slot, ctrl.merged)
                const instanceArray = [...instances.current.values()]
                // Only call onRest when all springs have come to rest
                if (!instanceArray.some(v => v.ctrl.isActive)) {
                  if (ref) {
                    startQueue.current.endResolver &&
                      startQueue.current.endResolver()
                    startQueue.current.endResolver = null
                  }

                  // run full cleanup when all instances of controller are done animating
                  const filter = ({ key: _key }) =>
                    !~destroyedRef.current.indexOf(_key)
                  state.current = {
                    ...state.current,
                    deleted: state.current.deleted.filter(filter),
                    transitions: state.current.transitions.filter(filter)
                  }

                  // update when all transitions is complete to clean dom of removed elements.
                  forceUpdate()
                }
              }
            }

            const parser = () =>
              ctrlKeyframeParser(
                to,
                config,
                setNext(resolve, last, props => ctrl.update(props, onEnd)),
                (finished = true) => ctrl.stop(finished)
              )
            ref ? startQueue.current.queue.enqueue(parser) : parser()
          }
        }
      )

      first.current = false
      state.current = {
        ...state.current,
        transitions,
        prevProps: props,
        ...rest
      }
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
    tag: 'TransitionHook'
  }))

  return state.current.transitions.map(({ item, state, key }) => ({
    item,
    key,
    state,
    props: instances.current.get(key).ctrl.getValues()
  }))
}
