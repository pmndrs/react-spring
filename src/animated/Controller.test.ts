import createMockRaf from 'mock-raf'
import { Controller } from './Controller'
import * as Globals from './Globals'

let mockRaf: MockRaf
beforeEach(() => {
  mockRaf = createMockRaf()
  Globals.assign({
    now: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
    cancelAnimationFrame: mockRaf.cancel,
  })
})

test('update simple value', () => {
  const ctrl = new Controller<{ x: number; y?: number }>()
  ctrl.update({ x: 0 })
  ctrl.start()
  expect(ctrl.animated.x.getValue()).toBe(0)

  ctrl.update({ x: 100, y: 50 })
  expect(ctrl.animated.x.getValue()).toBe(0)

  ctrl.start()

  mockRaf.step({ count: 10 })
  expect(ctrl.animated.x.getValue()).toBeCloseTo(56.4)

  mockRaf.step({ count: 100 })
  expect(ctrl.animated.x.getValue()).toBe(100)
})

test('update array value', () => {
  const ctrl = new Controller<{ x: number[] }>()
  ctrl.update({ x: [0, 0] })
  ctrl.start()
  expect(ctrl.animated.x.getValue()).toEqual([0, 0])

  ctrl.update({ x: [10, 20] })
  expect(ctrl.animated.x.getValue()).toEqual([0, 0])

  ctrl.start()

  mockRaf.step({ count: 10 })
  expect(ctrl.animated.x.getValue()[0]).toBeCloseTo(5.64)
  expect(ctrl.animated.x.getValue()[1]).toBeCloseTo(11.28)

  mockRaf.step({ count: 100 })
  expect(ctrl.animated.x.getValue()).toEqual([10, 20])
})
