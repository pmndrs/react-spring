import type {
  FrameFn,
  FrameUpdateFn,
  NativeRaf,
  Rafz,
  Timeout,
  Throttled,
} from './types'

export type { FrameFn, FrameUpdateFn, Timeout, Throttled, Rafz }

let updateQueue = makeQueue<FrameUpdateFn>()

/**
 * Schedule an update for next frame.
 * Your function can return `true` to repeat next frame.
 */
export const raf: Rafz = fn => schedule(fn, updateQueue)

let writeQueue = makeQueue<FrameFn>()
raf.write = fn => schedule(fn, writeQueue)

let onStartQueue = makeQueue<FrameFn>()
raf.onStart = fn => schedule(fn, onStartQueue)

let onFrameQueue = makeQueue<FrameFn>()
raf.onFrame = fn => schedule(fn, onFrameQueue)

let onFinishQueue = makeQueue<FrameFn>()
raf.onFinish = fn => schedule(fn, onFinishQueue)

let timeouts: Timeout[] = []
raf.setTimeout = (handler, ms) => {
  let time = raf.now() + ms
  let cancel = () => {
    let i = timeouts.findIndex(t => t.cancel == cancel)
    if (~i) timeouts.splice(i, 1)
    pendingCount -= ~i ? 1 : 0
  }

  let timeout: Timeout = { time, handler, cancel }
  timeouts.splice(findTimeout(time), 0, timeout)
  pendingCount += 1

  start()
  return timeout
}

/** Find the index where the given time is not greater. */
let findTimeout = (time: number) =>
  ~(~timeouts.findIndex(t => t.time > time) || ~timeouts.length)

raf.cancel = fn => {
  onStartQueue.delete(fn)
  onFrameQueue.delete(fn)
  onFinishQueue.delete(fn)
  updateQueue.delete(fn)
  writeQueue.delete(fn)
}

raf.sync = fn => {
  sync = true
  raf.batchedUpdates(fn)
  sync = false
}

raf.throttle = fn => {
  let lastArgs: any
  function queuedFn() {
    try {
      fn(...lastArgs)
    } finally {
      lastArgs = null
    }
  }
  function throttled(...args: any) {
    lastArgs = args
    raf.onStart(queuedFn)
  }
  throttled.handler = fn
  throttled.cancel = () => {
    onStartQueue.delete(queuedFn)
    lastArgs = null
  }
  return throttled as any
}

let nativeRaf =
  typeof window != 'undefined'
    ? (window.requestAnimationFrame as NativeRaf)
    : () => {}

raf.use = impl => (nativeRaf = impl)
raf.now = typeof performance != 'undefined' ? () => performance.now() : Date.now
raf.batchedUpdates = fn => fn()
raf.catch = console.error

raf.frameLoop = 'always'

raf.advance = () => {
  if (raf.frameLoop !== 'demand') {
    console.warn(
      'Cannot call the manual advancement of rafz whilst frameLoop is not set as demand'
    )
  } else {
    update()
  }
}

/** The most recent timestamp. */
let ts = -1

/** The number of pending tasks  */
let pendingCount = 0

/** When true, scheduling is disabled. */
let sync = false

function schedule<T extends Function>(fn: T, queue: Queue<T>) {
  if (sync) {
    queue.delete(fn)
    fn(0)
  } else {
    queue.add(fn)
    start()
  }
}

function start() {
  if (ts < 0) {
    ts = 0
    if (raf.frameLoop !== 'demand') {
      nativeRaf(loop)
    }
  }
}

function stop() {
  ts = -1
}

function loop() {
  if (~ts) {
    nativeRaf(loop)
    raf.batchedUpdates(update)
  }
}

function update() {
  let prevTs = ts
  ts = raf.now()

  // Flush timeouts whose time is up.
  let count = findTimeout(ts)
  if (count) {
    eachSafely(timeouts.splice(0, count), t => t.handler())
    pendingCount -= count
  }

  if (!pendingCount) {
    stop()

    return
  }

  onStartQueue.flush()
  updateQueue.flush(prevTs ? Math.min(64, ts - prevTs) : 16.667)
  onFrameQueue.flush()
  writeQueue.flush()
  onFinishQueue.flush()
}

interface Queue<T extends Function = any> {
  add: (fn: T) => void
  delete: (fn: T) => boolean
  flush: (arg?: any) => void
}

function makeQueue<T extends Function>(): Queue<T> {
  let next = new Set<T>()
  let current = next
  return {
    add(fn) {
      pendingCount += current == next && !next.has(fn) ? 1 : 0
      next.add(fn)
    },
    delete(fn) {
      pendingCount -= current == next && next.has(fn) ? 1 : 0
      return next.delete(fn)
    },
    flush(arg) {
      if (current.size) {
        next = new Set()
        pendingCount -= current.size
        eachSafely(current, fn => fn(arg) && next.add(fn))
        pendingCount += next.size
        current = next
      }
    },
  }
}

interface Eachable<T> {
  forEach(cb: (value: T) => void): void
}

function eachSafely<T>(values: Eachable<T>, each: (value: T) => void) {
  values.forEach(value => {
    try {
      each(value)
    } catch (e) {
      raf.catch(e as Error)
    }
  })
}

/** Tree-shakable state for testing purposes */
export const __raf = {
  /** The number of pending tasks */
  count(): number {
    return pendingCount
  },
  /** Whether there's a raf update loop running */
  isRunning(): boolean {
    return ts >= 0
  },
  /** Clear internal state. Never call from update loop! */
  clear() {
    ts = -1
    timeouts = []
    onStartQueue = makeQueue()
    updateQueue = makeQueue()
    onFrameQueue = makeQueue()
    writeQueue = makeQueue()
    onFinishQueue = makeQueue()
    pendingCount = 0
  },
}
