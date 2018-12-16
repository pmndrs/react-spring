import React, { useRef, useState, useEffect, useMemo } from 'react'
import Controller from '../animated/Controller'
import { parseKeyframedUpdate, setNext } from './KeyframesHook'
import { toArray, callProp } from '../shared/helpers'

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

  let delay = 0

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

const map = new Map([])
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

  const [, forceUpdate] = useState()
  const instances = useRef(map)
  const first = useRef(true)
  const mounted = useRef(false)
  const activeSlots = useRef({})
  const state = useRef({
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
      const { transitions, ...rest } = calculateDiffInItems(
        state.current,
        props
      )
      transitions.forEach(
        ({ state: slot, to, config, trail, key, item, destroyed }) => {
          !instances.current.has(key) &&
            instances.current.set(key, {
              ctrl: new Controller({
                ...from,
                ...(first.current && initial),
                config,
                delay: trail,
                ref,
              }),
              resolve: { current: null },
              last: { current: true },
            })

          const instance = instances.current.get(key)
          const instanceArray = [...instances.current.values()]
          const { ctrl, resolve, last } = instance

          if (slot === 'update' || slot !== activeSlots.current[key]) {
            // add the current running slot to the active slots ref so the same slot isnt re-applied
            activeSlots.current[key] = slot
            function onEnd({ finished }) {
              
              resolve.current && resolve.current(ctrl.merged)
              if (last.current && mounted.current && finished) {
                if (destroyed && onDestroyed) onDestroyed(item)
                if (destroyed) {
                  const filter = ({ key: _key }) => _key !== key
                  state.current = {
                    ...state.current,
                    deleted: state.current.deleted.filter(filter),
                    transitions: state.current.transitions.filter(filter),
                  }
                  if (!instanceArray.some(v => v.ctrl.isActive))
                    forceUpdate()
                }

                // Only call onRest when all springs have come to rest
                if (onRest && !instanceArray.some(v => v.ctrl.isActive))
                  onRest(item, slot, ctrl.merged)
              }
            }

            parseKeyframedUpdate(
              to,
              config,
              setNext(resolve, last, props => ctrl.update(props, onEnd)),
              (finished = true) => ctrl.stop(finished)
            )
          }
        }
      )
      first.current = false
      state.current = {
        ...state.current,
        transitions,
        prevProps: props,
        ...rest,
      }
    },
    [mapKeys(items, _currentKeys).join('')]
  )

  if (props.ref)
    props.ref.current = [...instances.current.values()].map(v => v.ctrl)

  return state.current.transitions.map(({ item, state, key }) => ({
    item,
    key,
    state,
    props: instances.current.get(key).ctrl.getValues(),
  }))
}
