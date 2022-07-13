import createMockRaf, { MockRaf } from 'mock-raf'
import { raf, __raf } from './index'
import { Globals } from '@react-spring/shared'

let mockRaf: MockRaf
beforeEach(() => {
  mockRaf = createMockRaf()
  Globals.assign({
    now: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
  })
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
    raf(() => {})
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(false)
  })
  it('resumes running jobs after stopping looping', () => {
    const fn = jest.fn().mockReturnValue(false)
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
  it('loops as long as one update loop is scheduled', () => {
    raf(() => true)
    raf(() => false)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
    mockRaf.step()
    expect(__raf.isRunning()).toBe(true)
  })
})
