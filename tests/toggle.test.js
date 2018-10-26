import React from 'react'
import { render, cleanup } from 'react-testing-library'

import { Globals } from '../src/targets/web'
import createMockRaf from 'mock-raf'
import { Toggler } from '../stories/tests/toggle'

test('toggle', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  // Render the toggler in the first state
  const { debug, getByText, rerender } = render(<Toggler toggle={false} />)

  // Expect box1 to start with opacity 0
  const box1 = getByText('Component A')
  expect(parseFloat(box1.style.opacity)).toBe(0)

  // Expect box2 to not exist
  expect(() => getByText('Component B')).toThrow()

  mockRaf.step({ count: 100 })

  // Expect box1 to have opacity 1
  expect(parseFloat(box1.style.opacity)).toBe(1)

  // Toggle the component
  rerender(<Toggler toggle={true} />)

  mockRaf.step({ count: 10 })

  // Expect box1 to have low opacity
  expect(parseFloat(box1.style.opacity)).toBeCloseTo(0.43598713658796656)

  // Expect box2 to have appeared
  const box2 = getByText('Component B')
  expect(parseFloat(box2.style.opacity)).toBeCloseTo(0.5640128634120333)

  mockRaf.step({ count: 100 })

  // Expect box1 to be unmounted
  expect(() => getByText('Component A')).toThrow()

  // Expect box2 to have opacity 1
  expect(parseFloat(box2.style.opacity)).toBeCloseTo(1)

  cleanup()
})
