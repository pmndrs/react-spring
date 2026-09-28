import type {
  FrameFn,
  FrameUpdateFn,
  NativeRaf,
  Rafz,
  Timeout,
  Throttled,
} from './types'

export type { FrameFn, FrameUpdateFn, Timeout, Throttled, Rafz }

function createInstance() {
  let updateQueue = makeQueue<FrameUpdateFn>()

  /**
   * Schedule an update for next frame.
   * Your function can return `true` to repeat next frame.
   */
  const raf: Rafz = fn => schedule(fn, updateQueue)

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
    const time = raf.now() + ms
    const cancel = () => {
      const i = timeouts.findIndex(t => t.cancel == cancel)
      if (~i) timeouts.splice(i, 1)
      pendingCount -= ~i ? 1 : 0
    }

    const timeout: Timeout = { time, handler, cancel }
    timeouts.splice(findTimeout(time), 0, timeout)
    pendingCount += 1

    wake()
    return timeout
  }

  /** Find the index where the given time is not greater. */
  const findTimeout = (time: number) =>
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
      : // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}

  raf.use = impl => (nativeRaf = impl)
  raf.now =
    typeof performance != 'undefined' ? () => performance.now() : Date.now
  raf.batchedUpdates = fn => fn()
  raf.catch = console.error

  raf.frameLoop = 'always'

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  raf.onDemand = () => {}

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

  /** When true, the next native frame is already booked. */
  let booked = false

  function schedule<T extends Function>(fn: T, queue: Queue<T>) {
    if (sync) {
      queue.delete(fn)
      fn(0)
    } else {
      queue.add(fn)
      wake()
    }
  }

  // New work was scheduled (animation start, loop/sequence restart, delay).
  // In demand mode the host must be told, since it may have stopped driving.
  function wake() {
    start()
    if (raf.frameLoop === 'demand') {
      raf.onDemand()
    }
  }

  function start() {
    if (ts < 0) {
      ts = 0
      // A loop that just stopped still has its next frame booked. Restarting
      // before that frame reuses it; booking another would run two loops and
      // tick every job twice per frame.
      if (raf.frameLoop !== 'demand' && !booked) {
        booked = true
        nativeRaf(loop)
      }
    }
  }

  function stop() {
    ts = -1
  }

  function loop() {
    booked = false
    if (~ts) {
      booked = true
      nativeRaf(loop)
      raf.batchedUpdates(update)
    }
  }

  function update() {
    const prevTs = ts
    ts = raf.now()

    // Flush timeouts whose time is up.
    const count = findTimeout(ts)
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
    const wrote = writeQueue.flush()
    onFinishQueue.flush()

    // Work remains for the next frame (e.g. an animation still in flight).
    // In demand mode, ask the host to render it — flushing re-queues via the
    // queue's internal `add`, which bypasses `schedule`, so this is the only
    // signal for a continuing animation.
    //
    // A frame that wrote to the host asks for one more: a value animated on
    // another clock (a web spring driving a mesh) writes again next frame, and
    // a host that stopped in between can only restart a frame late, halving
    // its frame rate. The cost is one extra, empty frame after any animation
    // ends, including ones on this clock.
    if (raf.frameLoop === 'demand' && (pendingCount > 0 || wrote)) {
      raf.onDemand()
    }
  }

  interface Queue<T extends Function = any> {
    add: (fn: T) => void
    delete: (fn: T) => boolean
    /** Returns true when any function ran. */
    flush: (arg?: any) => boolean
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
        if (!current.size) return false
        next = new Set()
        pendingCount -= current.size
        eachSafely(current, fn => fn(arg) && next.add(fn))
        pendingCount += next.size
        current = next
        return true
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

  /** Internal state, for testing purposes */
  const __raf = {
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
      booked = false
      timeouts = []
      onStartQueue = makeQueue()
      updateQueue = makeQueue()
      onFrameQueue = makeQueue()
      writeQueue = makeQueue()
      onFinishQueue = makeQueue()
      pendingCount = 0
    },
  }

  return { raf, __raf }
}

/**
 * Create a scheduler with its own queues, timeouts and frame driver. Each
 * target that drives frames differently (e.g. `@react-spring/three`, which
 * follows React Three Fiber) needs its own, so it can't stall the others.
 *
 * @internal
 */
export const createRafz = (): Rafz => createInstance().raf

const instance = createInstance()

/**
 * Schedule an update for next frame.
 * Your function can return `true` to repeat next frame.
 */
export const raf: Rafz = instance.raf

/** Internal state of the default scheduler, for testing purposes */
export const __raf = instance.__raf
