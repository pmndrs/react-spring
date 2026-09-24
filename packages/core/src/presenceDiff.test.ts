import { diffPresence, getKeys, PresenceDiffEntry } from './presenceDiff'

type Entry = PresenceDiffEntry<string>

const entry = (
  key: string,
  phase: Entry['phase'] = 'enter',
  expired = false
): Entry => ({ key, item: key, phase, expired })

const defaults = { hasLeave: true, hasUpdate: false }

const diff = (
  prev: Entry[],
  items: string[],
  options: Partial<Parameters<typeof diffPresence<string>>[3]> = {}
) => diffPresence(prev, items, items, { ...defaults, ...options })

const summary = ({ next }: { next: Entry[] }) =>
  next.map(e => `${e.key}:${e.phase}`)

const changesOf = ({ changes }: { changes: Map<unknown, string> }) =>
  Object.fromEntries(changes)

describe('diffPresence', () => {
  it('mounts new items as entering', () => {
    const result = diff([], ['a', 'b'])
    expect(summary(result)).toEqual(['a:enter', 'b:enter'])
    expect(changesOf(result)).toEqual({ a: 'mount', b: 'mount' })
  })

  it('reuses entries by key and swaps in the new item', () => {
    const prev: PresenceDiffEntry<unknown>[] = [entry('a')]
    const result = diffPresence(prev, [{ id: 'a' }], ['a'], defaults)
    expect(result.next).toEqual([
      { key: 'a', item: { id: 'a' }, phase: 'enter', expired: false },
    ])
    expect(result.changes.size).toBe(0)
  })

  it('updates present entries only when an "update" phase exists', () => {
    const prev = [entry('a'), entry('b', 'update')]
    expect(diff(prev, ['a', 'b']).changes.size).toBe(0)

    const result = diff(prev, ['a', 'b'], { hasUpdate: true })
    expect(summary(result)).toEqual(['a:update', 'b:update'])
    expect(changesOf(result)).toEqual({ a: 'update', b: 'update' })
  })

  it('keeps removed entries at their old relative position while leaving', () => {
    const prev = [entry('a'), entry('b'), entry('c'), entry('d')]
    const result = diff(prev, ['a', 'c', 'e'])
    expect(summary(result)).toEqual([
      'a:enter',
      'b:leave',
      'c:enter',
      'd:leave',
      'e:enter',
    ])
    expect(changesOf(result)).toEqual({ e: 'mount', b: 'leave', d: 'leave' })
  })

  it('places leading removed entries first', () => {
    const result = diff([entry('a'), entry('b')], ['b'])
    expect(summary(result)).toEqual(['a:leave', 'b:enter'])
  })

  it('does not restart entries that are already leaving', () => {
    const result = diff([entry('a', 'leave')], [])
    expect(summary(result)).toEqual(['a:leave'])
    expect(result.changes.size).toBe(0)
  })

  it('drops removed entries when there is no "leave" phase', () => {
    const result = diff([entry('a'), entry('b', 'leave')], [], {
      hasLeave: false,
    })
    expect(result.next).toEqual([])
    expect(result.changes.size).toBe(0)
  })

  it('re-enters an entry whose key comes back while leaving', () => {
    const prev = [entry('a', 'leave')]
    const result = diff(prev, ['a'])
    expect(summary(result)).toEqual(['a:enter'])
    expect(changesOf(result)).toEqual({ a: 'enter' })
  })

  it('drops expired entries', () => {
    const result = diff([entry('a', 'leave', true), entry('b')], ['b'])
    expect(summary(result)).toEqual(['b:enter'])
  })

  it('mounts a fresh entry when an expired key comes back', () => {
    const result = diff([entry('a', 'leave', true)], ['a'])
    expect(summary(result)).toEqual(['a:enter'])
    expect(changesOf(result)).toEqual({ a: 'mount' })
  })

  describe('when "expires" is false', () => {
    it('keeps expired entries', () => {
      const result = diff([entry('a', 'leave', true)], [], { expires: false })
      expect(result.next).toEqual([entry('a', 'leave', true)])
      expect(result.changes.size).toBe(0)
    })

    it('re-enters an expired entry whose key comes back', () => {
      const result = diff([entry('a', 'leave', true)], ['a'], {
        expires: false,
      })
      expect(result.next).toEqual([entry('a', 'enter')])
      expect(changesOf(result)).toEqual({ a: 'enter' })
    })
  })

  it('treats every entry as new on reset', () => {
    const prev = [entry('a'), entry('b', 'leave')]
    const result = diff(prev, ['a'], { reset: true })
    expect(summary(result)).toEqual(['a:enter'])
    expect(changesOf(result)).toEqual({ a: 'mount' })
  })

  it('sorts the displayed order, including leaving entries', () => {
    const prev = [entry('c'), entry('b')]
    const result = diff(prev, ['c', 'a'], {
      sort: (x, y) => x.localeCompare(y),
    })
    expect(summary(result)).toEqual(['a:enter', 'b:leave', 'c:enter'])
  })

  describe('when "mode" is "wait"', () => {
    it('holds new entries back until nothing is leaving', () => {
      const prev = [entry('a'), entry('b')]
      const result = diff(prev, ['c', 'd'], { mode: 'wait' })
      expect(summary(result)).toEqual(['a:leave', 'b:leave'])
      expect(changesOf(result)).toEqual({ a: 'leave', b: 'leave' })
      expect(result.held).toEqual(['c', 'd'])
    })

    it('keeps updating entries that stay', () => {
      const prev = [entry('a'), entry('b')]
      const result = diff(prev, ['a', 'c'], { mode: 'wait', hasUpdate: true })
      expect(summary(result)).toEqual(['a:update', 'b:leave'])
    })

    it('mounts the held entries once the leaving entries expire', () => {
      const prev = [entry('a', 'leave', true), entry('b', 'leave', true)]
      const result = diff(prev, ['c', 'd'], { mode: 'wait' })
      expect(summary(result)).toEqual(['c:enter', 'd:enter'])
      expect(result.held).toEqual([])
    })

    it('re-enters a leaving entry without waiting for itself', () => {
      const prev = [entry('a', 'leave')]
      const result = diff(prev, ['a'], { mode: 'wait' })
      expect(summary(result)).toEqual(['a:enter'])
      expect(result.held).toEqual([])
    })

    it('waits for the other leaving entries when one re-enters', () => {
      const prev = [entry('a', 'leave'), entry('b', 'leave')]
      const result = diff(prev, ['a', 'c'], { mode: 'wait' })
      expect(summary(result)).toEqual(['a:enter', 'b:leave'])
      expect(changesOf(result)).toEqual({ a: 'enter' })
      expect(result.held).toEqual(['c'])
    })

    it('does not wait for expired entries kept by "expires: false"', () => {
      const prev = [entry('a', 'leave', true)]
      const result = diff(prev, ['b'], { mode: 'wait', expires: false })
      expect(summary(result)).toEqual(['a:leave', 'b:enter'])
      expect(result.held).toEqual([])
    })
  })
})

describe('getKeys', () => {
  it('uses the items when no keys are given', () => {
    expect(getKeys(['a', 'b'], undefined, null)).toEqual(['a', 'b'])
  })

  it('maps items with a function', () => {
    expect(getKeys([{ id: 1 }], item => item.id, null)).toEqual([1])
  })

  it('assigns an array of keys by index', () => {
    expect(getKeys(['a', 'b'], [1, 2], null)).toEqual([1, 2])
  })

  it('generates keys when keys is null, reusing keys of present items', () => {
    const a = {}
    const b = {}
    const [keyA] = getKeys([a], null, null)
    const prev = [{ key: keyA, item: a, phase: 'enter' }]
    const [reusedA, keyB] = getKeys([a, b], null, prev)
    expect(reusedA).toBe(keyA)
    expect(keyB).not.toBe(keyA)
  })

  it('does not reuse the key of a leaving item when keys is null', () => {
    const a = {}
    const prev = [{ key: 1, item: a, phase: 'leave' }]
    expect(getKeys([a], null, prev)[0]).not.toBe(1)
  })
})
