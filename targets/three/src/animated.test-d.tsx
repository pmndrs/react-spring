import * as React from 'react'
import { it, expectTypeOf } from 'vitest'

import { animated, SpringValue, useSpring } from './index'

type MeshProps = React.ComponentProps<typeof animated.mesh>

it('#2312: array springs can drive vector and euler props', () => {
  function scenario() {
    const { position, rotation, scale } = useSpring({
      position: [0, 1, 2] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
    })
    expectTypeOf(rotation).toEqualTypeOf<
      SpringValue<[number, number, number]>
    >()

    expectTypeOf(position).toExtend<MeshProps['position']>()
    expectTypeOf(rotation).toExtend<MeshProps['rotation']>()
    expectTypeOf(scale).toExtend<MeshProps['scale']>()

    expectTypeOf<SpringValue<string>>().not.toExtend<MeshProps['rotation']>()
    expectTypeOf<SpringValue<[string, string]>>().not.toExtend<
      MeshProps['position']
    >()
  }
  expectTypeOf(scenario).toBeFunction()
})

it('#2312: const tuple springs can drive group props', () => {
  function scenario(clicked: boolean) {
    const { position, rotation } = useSpring({
      position: [0, 0, 0] as const,
      rotation: clicked
        ? ([Math.PI / 4, Math.PI / 4, 0] as const)
        : ([Math.PI / 2, Math.PI / 4, 0] as const),
    })
    return <animated.group position={position} rotation={rotation} />
  }
  expectTypeOf(scenario).toBeFunction()
})
