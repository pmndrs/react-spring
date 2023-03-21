import { renderHook } from '@testing-library/react'

import { useSpringValue } from './useSpringValue'

describe('useSpringValue', () => {
  it('should return a SpringValue with the initial value set & be animatable', async () => {
    const { result } = renderHook(() => useSpringValue(0))

    expect(result.current.get()).toBe(0)

    result.current.start(1)

    await global.advanceUntilIdle()
    const frames = global.getFrames(result.current)

    expect(frames).toMatchInlineSnapshot(`
      [
        0.022634843307857987,
        0.07615528894993949,
        0.14727295456877587,
        0.226793329378144,
        0.30850531916036833,
        0.3883524421610094,
        0.4638171205392546,
        0.5334657448036914,
        0.5966146523130327,
        0.653086718031782,
        0.7030355736424124,
        0.7468200657416287,
        0.7849158337229618,
        0.8178541406742544,
        0.84618056340198,
        0.8704280232770599,
        0.8911000586164687,
        0.908661309883985,
        0.9235329941206051,
        0.9360917483504706,
        0.9466706719880811,
        0.9555617327559859,
        0.9630189477450245,
        0.9692619326731112,
        0.974479544590839,
        0.9788334387327177,
        0.9824614283710769,
        0.9854805845242963,
        0.9879900455631954,
        0.9900735291663613,
        0.9918015536949567,
        0.9932333851170554,
        0.9944187307560263,
        0.9953992035746594,
        0.9962095813165257,
        0.9968788842438258,
        0.9974312938902624,
        0.997886933507673,
        0.9982625289470638,
        0.9985719667273453,
        0.9988267641056736,
        1,
      ]
    `)
  })

  it('should pass the props to the SpringValue', async () => {
    const onChange = jest.fn()

    const { result: spring1Result } = renderHook(() =>
      useSpringValue(0, {
        onChange,
        config: {
          tension: 250,
        },
      })
    )

    spring1Result.current.start(1)

    await global.advanceUntilIdle()
    const spring1Frames = global.getFrames(spring1Result.current)

    expect(onChange).toHaveBeenCalledTimes(spring1Frames.length)

    expect(spring1Frames).toMatchInlineSnapshot(`
      [
        0.03322035282414196,
        0.11115235982150365,
        0.2130842922652568,
        0.32437365472020624,
        0.4351150247228329,
        0.5390109579648729,
        0.6324388770927332,
        0.7136979238346725,
        0.7824149821427263,
        0.8390872502255999,
        0.8847388969420807,
        0.9206707563299439,
        0.948284154761085,
        0.9689624419925535,
        0.983996343637665,
        0.9945416938864688,
        1.0016003383581966,
        1.006016962813285,
        1.008486284526941,
        1.009566443632207,
        1.0096955708194038,
        1.0092094129953517,
        1.0083586011904877,
        1.00732467705411,
        1.0062343860893856,
        1.0051720249961695,
        1.0041898213810294,
        1.0033164473489222,
        1.0025638412971623,
        1.0019325485312394,
        1.001415802163774,
        1.0010025596964731,
        1,
      ]
    `)

    const { result: spring2Result } = renderHook(() => useSpringValue(0))

    spring2Result.current.start(1)

    await global.advanceUntilIdle()
    const spring2Frames = global.getFrames(spring2Result.current)

    expect(spring2Frames).not.toEqual(spring1Frames)
  })

  it('should not update the initial value on rerender', () => {
    const { result, rerender } = renderHook(props => useSpringValue(props), {
      initialProps: 0,
    })

    expect(result.current.get()).toBe(0)

    rerender(1)

    expect(result.current.get()).toBe(0)
  })

  it('should stop the animation when the hook is unmounted', async () => {
    const { result, unmount } = renderHook(() => useSpringValue(0))

    const promise = result.current.start(1)

    await global.advanceUntilValue(result.current, 0.5)

    unmount()

    await global.advanceUntilIdle()

    expect((await promise).value).toMatchInlineSnapshot(`0.5334657448036914`)
  })
})
