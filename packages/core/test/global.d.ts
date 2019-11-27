import { MockRaf } from 'mock-raf'
import { Controller, SpringValue, FrameValue } from '..'

declare global {
  let mockRaf: MockRaf

  let advanceUntil: (test: () => boolean) => void
  let advanceUntilIdle: () => void
  let advanceUntilValue: <T>(spring: FrameValue<T>, value: T) => void

  /** Collect all frames synchronously */
  let getFrames: {
    <T extends object>(ctrl: Controller<T>): T[]
    <T>(spring: SpringValue<T>): T[]
  }

  /** Wait one microtask tick between frames */
  let getAsyncFrames: <T extends object>(ctrl: Controller<T>) => Promise<T[]>

  const global: {
    mockRaf: typeof mockRaf
    advanceUntil: typeof advanceUntil
    advanceUntilIdle: typeof advanceUntilIdle
    advanceUntilValue: typeof advanceUntilValue
    getFrames: typeof getFrames
    getAsyncFrames: typeof getAsyncFrames
  }
}
