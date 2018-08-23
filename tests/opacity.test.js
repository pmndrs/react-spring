import React from 'react'
import { render, cleanup } from 'react-testing-library'

import createMockRaf from 'mock-raf'
import { FadeIn } from '../stories/tests/opacity'
import { Globals } from '../src/targets/web'

test('fade in', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const { container, getByText, debug } = render(<FadeIn />)

  const box = getByText('test')

  expect(parseFloat(box.style.opacity)).toBe(0)

  mockRaf.step({ count: 10 })

  expect(parseFloat(box.style.opacity)).toBeCloseTo(0.73)

  mockRaf.step({ count: 50 })

  expect(parseFloat(box.style.opacity)).toBeCloseTo(1)

  cleanup()
})
