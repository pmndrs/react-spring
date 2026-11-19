import { Controller } from './Controller'
import { declareUpdate } from './SpringValue'

// Issue2095: declarative rerenders must not make a successful new sequence
// inherit the interrupted result of its props-only preparation update.
describe('Controller declarative async-loop replacement', () => {
  it.each([
    ['raw update during second step', false, true],
    ['declarative update during first step', true, false],
    ['declarative update during second step', true, true],
  ] as const)('%s preserves the new loop', async (_, declarative, secondStep) => {
    const ctrl = new Controller<{ width: number }>()
    let iterations = 0
    const loop = vi.fn(() => ++iterations < 2)
    const props = () => {
      const update = {
        from: { width: 100 },
        to: [{ width: 200 }, { width: 300 }],
        loop,
      }
      return declarative ? declareUpdate(update) : update
    }
    const initial = ctrl.start(props())
    await global.advanceUntil(() => {
      const spring = ctrl.springs.width
      return secondStep
        ? spring.goal === 300 && spring.get() > 220 && spring.get() < 280
        : spring.goal === 200 && spring.get() > 120 && spring.get() < 180
    })
    const replacement = ctrl.start(props())
    await global.advanceUntilIdle()
    expect(ctrl.get().width).toBe(300)
    expect(ctrl.idle).toBe(true)
    expect(loop).toHaveBeenCalledTimes(2)
    expect(await replacement).toMatchObject({ finished: true, cancelled: false })
    await initial
  })
})
