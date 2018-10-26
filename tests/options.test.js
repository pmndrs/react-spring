import React from 'react'
import { render, cleanup } from 'react-testing-library'

import createMockRaf from 'mock-raf'
import { Spring, Globals } from '../src/targets/web'

test('immediate', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const { container, getByText, debug } = render(
    <Spring immediate={true} from={{ width: 200 }} to={{ width: 500 }}>
      {animatedStyle => <div style={animatedStyle}>test</div>}
    </Spring>
  )

  const box = getByText('test')

  // Allow 1 animation frames
  mockRaf.step({ count: 1 })
  expect(box.style.width).toBe('500px')

  cleanup()
})

test('delay', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  jest.useFakeTimers()

  const { container, getByText, debug } = render(
    <Spring delay={100} from={{ width: 200 }} to={{ width: 500 }}>
      {animatedStyle => <div style={animatedStyle}>test</div>}
    </Spring>
  )

  const box = getByText('test')

  // Expect box to start out at width=200px
  expect(box.style.width).toBe('200px')

  // Allow 100 animation frames
  mockRaf.step({ count: 100 })

  expect(box.style.width).toBe('500px')

  // Advance timers by 90ms
  jest.advanceTimersByTime(90)
  mockRaf.step({ count: 10 })


  // Advance timers by 10ms, this should trigger the animation
  jest.advanceTimersByTime(10)
  mockRaf.step({ count: 10 })

  // Expect the box to have started animating
  expect(box.style.width).not.toBe('200px')

  // Do another 100 animation frames
  mockRaf.step({ count: 100 })

  // Expect animation to have finished
  expect(box.style.width).toBe('500px')

  cleanup()
})
