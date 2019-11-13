import { MockRaf } from 'mock-raf'
import { Controller, SpringValue } from '..'

declare global {
  let mockRaf: MockRaf

  /** Collect all frames synchronously */
  let getFrames: {
    <T extends object>(ctrl: Controller<T>): T[]
    <T>(spring: SpringValue<T>): T[]
  }

  /** Wait one microtask tick between frames */
  let getAsyncFrames: <T extends object>(ctrl: Controller<T>) => Promise<T[]>

  const global: {
    mockRaf: typeof mockRaf
    getFrames: typeof getFrames
    getAsyncFrames: typeof getAsyncFrames
  }
}
