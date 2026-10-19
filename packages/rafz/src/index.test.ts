import createMockRaf, { MockRaf } from '@react-spring/mock-raf'
import { raf, __raf, createRafz } from './index'

let mockRaf: MockRaf
beforeEach(() => {
  mockRaf = createMockRaf()
  raf.use(mockRaf.raf)
  __raf.clear()
})

describe('raf looping', () => {
  it('is not initially looping', () => {
    expect(__raf.isRunning()).toBe(false)
  })
  it('loops when update is registered', () => {
    raf(() => true)
    expect(__raf.isRunning()).toBe(true)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
  })
  it('stops looping after single job', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    raf(() => {})
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(false)
  })
  it('resumes running jobs after stopping looping', () => {
    const fn = vi.fn().mockReturnValue(false)
    raf(fn)
    mockRaf.step()
    expect(fn).toHaveBeenCalledTimes(1)
    raf(fn)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(false)
    expect(fn).toHaveBeenCalledTimes(2)
  })
  it('runs one loop when restarted before the frame it already booked', () => {
    raf(() => {})
    mockRaf.step()
    mockRaf.step() // finds nothing to do and stops, with the next frame booked

    const fn = vi.fn(() => true)
    raf(fn)
    mockRaf.step()

    expect(fn).toHaveBeenCalledTimes(1)
  })
  it('loops as long as one update loop is scheduled', () => {
    raf(() => true)
    raf(() => false)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
  })
})

describe('demand mode', () => {
  afterEach(() => {
    raf.frameLoop = 'always'
    raf.onDemand = () => {}
  })

  it('asks the host for a frame when a timeout is set', () => {
    raf.frameLoop = 'demand'
    raf.onDemand = vi.fn()

    raf.setTimeout(() => {}, 100)

    expect(raf.onDemand).toHaveBeenCalled()
  })
})

describe('createRafz', () => {
  it('keeps its own queues and timeouts, apart from the default scheduler', () => {
    const otherMockRaf = createMockRaf()
    const other = createRafz()
    other.use(otherMockRaf.raf)
    other.now = otherMockRaf.now

    const onDefault = vi.fn()
    const onOther = vi.fn()
    const onOtherTimeout = vi.fn()
    raf(onDefault)
    other(onOther)
    other.setTimeout(onOtherTimeout, 0)

    mockRaf.step()
    expect(onDefault).toHaveBeenCalledTimes(1)
    expect(onOther).not.toHaveBeenCalled()
    expect(onOtherTimeout).not.toHaveBeenCalled()

    otherMockRaf.step()
    expect(onOther).toHaveBeenCalledTimes(1)
    expect(onOtherTimeout).toHaveBeenCalledTimes(1)
    expect(onDefault).toHaveBeenCalledTimes(1)
  })

  it('does not stop the default scheduler when switched to demand mode', () => {
    const other = createRafz()
    other.frameLoop = 'demand'

    const onDefault = vi.fn()
    raf(onDefault)
    mockRaf.step()

    expect(onDefault).toHaveBeenCalledTimes(1)
  })
})
