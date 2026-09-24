import { is, toArray } from '@react-spring/shared'
import type { ItemKeys, PresencePhase } from './types'

export interface PresenceDiffEntry<Item = any> {
  /** Any value from `getKeys`, even an object when the items are the keys. */
  key: unknown
  item: Item
  phase: PresencePhase
  /** The `leave` animation has finished. */
  expired: boolean
}

/** A `mount` enters with a new controller, an `enter` reuses a leaving one. */
export type PresenceChange = 'mount' | PresencePhase

export interface PresenceDiffOptions<Item> {
  hasLeave: boolean
  hasUpdate: boolean
  mode?: 'sync' | 'wait'
  reset?: boolean
  sort?: (a: Item, b: Item) => number
  expires?: boolean
}

export interface PresenceDiff<Item> {
  next: PresenceDiffEntry<Item>[]
  changes: Map<unknown, PresenceChange>
  /** The keys of new items held back by `mode: 'wait'`. */
  held: unknown[]
}

export function diffPresence<Item>(
  prev: readonly PresenceDiffEntry<Item>[],
  items: readonly Item[],
  keys: readonly unknown[],
  { hasLeave, hasUpdate, mode, reset, sort, expires }: PresenceDiffOptions<Item>
): PresenceDiff<Item> {
  const live = reset
    ? []
    : expires === false
      ? prev
      : prev.filter(entry => !entry.expired)
  const liveByKey = new Map(live.map(entry => [entry.key, entry]))
  const changes = new Map<unknown, PresenceChange>()

  let next = items.map((item, i): PresenceDiffEntry<Item> => {
    const key = keys[i]
    const old = liveByKey.get(key)
    let phase: PresencePhase = 'enter'
    if (!old) {
      changes.set(key, 'mount')
    } else if (old.phase == 'leave') {
      changes.set(key, 'enter')
    } else if (hasUpdate) {
      phase = 'update'
      changes.set(key, 'update')
    } else {
      phase = old.phase
    }
    return { key, item, phase, expired: false }
  })

  if (hasLeave) {
    const present = new Set(next.map(entry => entry.key))
    let cursor = -1
    for (const old of live) {
      if (present.has(old.key)) {
        cursor = next.findIndex(entry => entry.key === old.key)
      } else {
        if (old.phase != 'leave') changes.set(old.key, 'leave')
        next.splice(++cursor, 0, { ...old, phase: 'leave' })
      }
    }
  }

  const held: unknown[] = []
  if (
    mode == 'wait' &&
    next.some(entry => entry.phase == 'leave' && !entry.expired)
  ) {
    next = next.filter(entry => {
      if (changes.get(entry.key) != 'mount') return true
      changes.delete(entry.key)
      held.push(entry.key)
      return false
    })
  }

  if (sort) next.sort((a, b) => sort(a.item, b.item))

  return { next, changes, held }
}

/** Local state for auto-generated item keys */
let nextKey = 1

/**
 * Keys help with reusing transitions between renders. `keys` can be undefined
 * (the items themselves are the keys), a function (which maps each item to its
 * key), an array of keys (assigned to each item by index), or `null` (keys are
 * generated, and reused for identical items that are not leaving).
 */
export function getKeys(
  items: readonly any[],
  keys: ItemKeys | undefined,
  prev: readonly { key: any; item: any; phase: string }[] | null
): readonly any[] {
  if (keys === null) {
    const reused = new Set()
    return items.map(item => {
      const t =
        prev &&
        prev.find(t => t.item === item && t.phase !== 'leave' && !reused.has(t))
      if (t) {
        reused.add(t)
        return t.key
      }
      return nextKey++
    })
  }
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys)
}
