import React from 'react'
import { render, cleanup } from 'react-testing-library'

import createMockRaf from 'mock-raf'
import { Width } from '../../stories/tests/transform'
import { Globals } from '../targets/web'

test('width transform', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const { container, getByText, debug } = render(<Width />)

  const box = getByText('test')

  expect(box.style.width).toBe('0%')

  mockRaf.step({ count: 10 })

  expect(box.style.width).toBe('56.401286341203324%')

  mockRaf.step({ count: 100 })

  expect(box.style.width).toBe('100%')

  cleanup()
})
