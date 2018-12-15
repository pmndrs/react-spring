import React from 'react'
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
    item => !item.destroyed && !currSet.has(item.originalKey)
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

const map = new Map([])
/**
 * @param {TransitionProps} props
 */
export function useTransition (props) {
  const {
    items,
    keys: _currentKeys,
    from,
    initial,
    onRest,
    onDestroyed,
  } = get(props)

  const instances = React.useRef(map)
  const first = React.useRef(true)
  const mounted = React.useRef(false)
  const activeSlots = React.useRef({})
  const [state, setState] = React.useState({
    deleted: [],
    current: {},
    transitions: [],
    prevProps: null
  })

  React.useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  }, [])


  // Prop changes effect
  React.useEffect(
    () => {
      const { transitions, ...rest } = calculateDiffInItems(state, props)
      transitions.forEach(
        ({ state: slot, to, config, trail, key, item, destroyed }) => {
          !instances.current.has(key) &&
            instances.current.set(key, {
              ctrl: new Controller({
                ...(from || {}),
                ...((first.current && initial) || {}),
                config,
                delay: trail
              }),
              resolve: { current: null },
              last: { current: true }
            })

          const instance = instances.current.get(key)
          const { ctrl, resolve, last } = instance

          if (slot === 'update' || slot !== activeSlots.current[key]) {
            // add the current running slot to the active slots ref so the same slot isnt re-applied
            activeSlots.current[key] = slot
            function onEnd ({ finished }) {
              resolve.current && resolve.current(ctrl.merged)
              if (last.current && mounted.current && finished) {
                destroyed && onDestroyed && onDestroyed(item)
                destroyed &&
                  setState(state => {
                    const filter = ({ key: _key}) => _key !== key
                    return {
                      ...state,
                      deleted: state.deleted.filter(filter),
                      transitions: state.transitions.filter(filter)
                    }
                  })
                onRest && onRest(item, slot, ctrl.merged)
              }
            }

            const updater = props => {
              ctrl.update(props, onEnd)
            }

            const setNextKeyframe = setNext(resolve, last, updater)

            parseKeyframedUpdate(
              to,
              config,
              setNextKeyframe,
              (finished = true) => ctrl.stop(finished)
            )
          }
        }
      )
      first.current = false

      setState(() => ({transitions, prevProps: props, ...rest }))
    },
    [mapKeys(items, _currentKeys).join("")]
  )

  return state.transitions.map(({ item, state, key }) => ({
    item,
    key,
    state,
    props: instances.current.get(key).ctrl.getValues()
  }))
}
