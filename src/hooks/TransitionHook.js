import React from 'react'
import Controller from '../animated/Controller'
import { parseKeyframedUpdate, setNext } from './KeyframesHook'
import { toArray, callProp } from '../shared/helpers'

let guid = 0
let get = props => {
  let { items, keys = states => states, ...rest } = props
  items = toArray(items !== void 0 ? items : null)
  keys = typeof keys === 'function' ? items.map(keys) : toArray(keys)
  // Make sure numeric keys are interpreted as Strings (5 !== "5")
  return { items, keys: keys.map(key => String(key)), ...rest }
}

function debounce (func, delay = 0) {
  let timeoutId
  return function () {
    const context = this
    const args = arguments
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(context, args), delay)
  }
}

// function bufferedCall ()
function calculateDiffInItems ({ prevProps, ...state }, props) {
  const { keys: _keys, items: _items } = get(prevProps || {})
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

  removed.forEach(item => {
    const keyIndex = _keys.indexOf(item.originalKey)
    const state = 'leave'
    deleted.unshift({
      ...item,
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
    // Maybe we'll find it in the list of deleted items
    if (pos === -1) pos = deleted.findIndex(t => t.originalKey === left)
    // Checking right side as well
    if (pos === -1) pos = deleted.findIndex(t => t.originalKey === right)
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

const removeDeleted = (function () {
  let deleted = []
  const debounceUpdateState = debounce(({ current: state }, setState) => {
    setState({
      ...state,
      deleted: state.deleted.filter(
        item => deleted.indexOf(item.originalKey) === -1
      )
    })
    deleted = []
  }, 200)
  return function (key, stateRef, setState) {
    deleted.push(key)
    debounceUpdateState(stateRef, setState)
  }
})()

export function useTransition (props) {
  const {
    items,
    keys: _currentKeys,
    trail,
    from,
    initial,
    onRest,
    onDestroyed,
    unique,
    filter = states => states,
    ...rest
  } = get(props)

  const instances = React.useRef(new Map([]))
  const first = React.useRef(true)
  const mounted = React.useRef(false)
  const activeSlots = React.useRef({})
  const [state, setState] = React.useState({
    deleted: [],
    current: {},
    transitions: [],
    prevProps: null
  })

  // keep current state in a mutable ref so
  // promise callback will always have access to latest state
  const stateRef = React.useRef(state)
  stateRef.current = state
  const memoizedDiffInItemsCalc = React.useMemo(
    () => calculateDiffInItems(state, props),
    [props.items, state.deleted]
  )

  React.useEffect(() => {
    mounted.current = true
    return () => void (mounted.current = false)
  }, [])

  // Prop changes effect
  React.useEffect(
    () => {
      const { deleted, current, transitions } = memoizedDiffInItemsCalc
      transitions.forEach(
        ({ state: slot, to, config, key, originalKey, item, destroyed }) => {
          !instances.current.has(key) &&
            instances.current.set(key, {
              ctrl: new Controller({
                ...(from || {}),
                ...((first.current && initial) || {})
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
              resolve.current && resolve.current()
              if (last.current && mounted.current && finished) {
                destroyed && onDestroyed && onDestroyed(item)
                destroyed && removeDeleted(originalKey, stateRef, setState)
                onRest && onRest(item, slot, ctrl.merged)
              }
            }

            const updater = (config, props) => {
              const updateProps = {
                ...props,
                ...((config && { config }) || {})
              }
              ctrl.update(updateProps, onEnd)
            }

            const setNextKeyframe = setNext(
              resolve,
              last,
              updater.bind(null, config)
            )

            parseKeyframedUpdate(
              to,
              filter,
              setNextKeyframe,
              (finished = false) => ctrl.stop(finished)
            )
          }
        }
      )
      first.current = false

      setState({ ...state, deleted, current, transitions, prevProps: props })
    },
    [props.items]
  )

  // React.useEffect(
  //   () => {
  //     const { transitions } = state
  //     // for (let i = 0; i < transitions.length; i++) {
  //     //   const {
  //     //     state: slot,
  //     //     to,
  //     //     config,
  //     //     key,
  //     //     originalKey,
  //     //     item,
  //     //     destroyed
  //     //   } = transitions[i]

  //     //   const instance = instances.current.get(key)
  //     //   const { ctrl, resolve, last } = instance

  //     //   if (slot === 'update' || slot !== 'enter' && slot !== activeSlots.current[key]) {
  //     //     // add the current running slot to the active slots ref so the same slot isnt re-applied
  //     //     activeSlots.current[key] = slot
  //     //     function onEnd ({ finished }) {
  //     //       resolve.current && resolve.current()
  //     //       if (last.current && mounted.current && finished) {
  //     //         destroyed && onDestroyed && onDestroyed(item)
  //     //         destroyed && removeDeleted(originalKey, stateRef, setState)
  //     //         onRest && onRest(item, slot, ctrl.merged)
  //     //       }
  //     //     }

  //     //     const updater = (config, props) => {
  //     //       const updateProps = {
  //     //         ...props,
  //     //         ...((config && { config }) || {})
  //     //       }
  //     //       ctrl.update(updateProps, onEnd)
  //     //     }

  //     //     const setNextKeyframe = setNext(
  //     //       resolve,
  //     //       last,
  //     //       updater.bind(null, config)
  //     //     )

  //     //     parseKeyframedUpdate(
  //     //       to,
  //     //       filter,
  //     //       setNextKeyframe,
  //     //       (finished = false) => ctrl.stop(finished)
  //     //     )
  //     //   }
  //     // }

  //     // first.current = false
  //   },
  //   [state.transitions]
  // )

  return state.transitions
    // .filter(({ key }) => instances.current.get(key).hasLoaded)
    .map(({ item, state, key }) => ({
      item,
      key,
      state,
      props: instances.current.get(key).ctrl.getValues()
    }))
}
