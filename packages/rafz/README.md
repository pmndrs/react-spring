# @react-spring/rafz

Coordinate `requestAnimationFrame` calls across your app and/or libraries.

- < 700 bytes min+gzip
- Timeout support
- Batching support (eg: `ReactDOM.unstable_batchedUpdates`)
- Uncaught errors are isolated
- Runs continuously (to reduce frame skips)

&nbsp;

## API

```ts
import { raf } from 'rafz'

// Schedule an update
raf(dt => {})

// Start an update loop
raf(dt => true)

// Cancel an update
raf.cancel(fn)

// Schedule a mutation
raf.write(() => {})

// Before any updates
raf.onStart(() => {})

// Before any mutations
raf.onFrame(() => {})

// After any mutations
raf.onFinish(() => {})

// Set a timeout that runs on nearest frame
raf.setTimeout(() => {}, 1000)

// Use a polyfill
raf.use(require('@essentials/raf').raf)

// Get the current time
raf.now() // => number

// Set how you want to control raf firing
raf.frameLoop = 'demand' | 'always'
```

&nbsp;

## Notes

- Functions can only be scheduled once per queue per frame.
- Thus, trying to schedule a function twice is a no-op.
- The `update` phase is for updating JS state (eg: advancing an animation).
- The `write` phase is for updating native state (eg: mutating the DOM).
- [Reading] is allowed any time before the `write` phase.
- Writing is allowed any time after the `onFrame` phase.
- Timeout handlers run first on each frame.
- Any handler (except timeouts) can return `true` to run again next frame.
- The `raf.cancel` function only works with `raf` handlers.
- Use `raf.sync` to disable scheduling in its callback.
- Override `raf.batchedUpdates` to avoid excessive re-rendering in React.

[reading]: https://gist.github.com/paulirish/5d52fb081b3570c81e3a

&nbsp;

## `raf.throttle`

Wrap a function to limit its execution to once per frame. If called more than once
in a single frame, the last arguments are used.

```ts
let log = raf.throttle(console.log)

log(1)
log(2) // nothing logged yet

raf.onStart(() => {
  // "2" is logged by now
})

// Cancel a pending call.
log.cancel()

// Access the wrapped function.
log.handler
```

## Prior art

- [fastdom](https://github.com/wilsonpage/fastdom)
- [framesync](https://github.com/Popmotion/popmotion/tree/master/packages/framesync)
