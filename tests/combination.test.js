import React from 'react'
import { render, cleanup } from 'react-testing-library'

import createMockRaf from 'mock-raf'
import { ColorAndHeight } from '../stories/tests/combination'
import { Globals } from '../src/targets/web'

test('width transform', () => {
  const mockRaf = createMockRaf()

  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const { container, getByText, debug } = render(<ColorAndHeight />)

  const box = getByText('test')

  expect(box.style.backgroundColor).toBe('rgb(0, 128, 0)')
  expect(box.style.height).toBe('100px')

  mockRaf.step({ count: 10 })

  expect(box.style.backgroundColor).toBe('rgb(144, 56, 144)')
  expect(parseFloat(box.style.height.slice(0, -2))).toBeCloseTo(325.6051453648133)

  mockRaf.step({ count: 10 })

  expect(box.style.backgroundColor).toBe('rgb(231, 12, 231)')
  expect(parseFloat(box.style.height.slice(0, -2))).toBeCloseTo(462.6970463957336)

  mockRaf.step({ count: 10 })

  expect(box.style.backgroundColor).toBe('rgb(251, 2, 251)')
  expect(parseFloat(box.style.height.slice(0, -2))).toBeCloseTo(493.36314302940417)

  mockRaf.step({ count: 100 })

  expect(box.style.backgroundColor).toBe('rgb(255, 0, 255)')
  expect(box.style.height).toBe('500px')

  cleanup()
})
