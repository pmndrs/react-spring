import createMockRaf from 'mock-raf'
import Controller from '../animated/Controller'
import { Globals } from '../targets/web'

test('update simple value', () => {
  const mockRaf = createMockRaf()
  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const ctrl = new Controller() as any
  ctrl.update({ x: 0 })
  ctrl.start()
  expect(ctrl.getValues().x.getValue()).toBe(0)

  ctrl.update({ x: 100, y: 50 })
  expect(ctrl.getValues().x.getValue()).toBe(0)

  ctrl.start()

  mockRaf.step({ count: 10 })
  expect(ctrl.getValues().x.getValue()).toBeCloseTo(56.4)

  mockRaf.step({ count: 100 })
  expect(ctrl.getValues().x.getValue()).toBe(100)
})

test('update array value', () => {
  const mockRaf = createMockRaf()
  Globals.injectFrame(mockRaf.raf, mockRaf.cancel)
  Globals.injectNow(mockRaf.now)

  const ctrl = new Controller() as any
  ctrl.update({ x: [0, 0] })
  ctrl.start()
  expect(ctrl.getValues().x.getValue()).toEqual([0, 0])

  ctrl.update({ x: [10, 20] })
  expect(ctrl.getValues().x.getValue()).toEqual([0, 0])

  ctrl.start()

  mockRaf.step({ count: 10 })
  expect(ctrl.getValues().x.getValue()[0]).toBeCloseTo(5.64)
  expect(ctrl.getValues().x.getValue()[1]).toBeCloseTo(11.28)

  mockRaf.step({ count: 100 })
  expect(ctrl.getValues().x.getValue()).toEqual([10, 20])
})
