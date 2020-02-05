import React from 'react'
import {
  useTransition,
  TransitionFn,
  UseTransitionProps,
} from './useTransition'
import { RenderResult, render } from '@testing-library/react'
import { is } from 'shared'

describe('useTransition', () => {
  let transition: TransitionFn

  // Call the "useTransition" hook and update local variables.
  const update = createUpdater(({ args }) => {
    transition = useTransition(...args)
    return null
  })

  it('unmounts after leave', () => {
    const props = { enter: {}, leave: {} }
    update(true, props)
  })

  describe('async leave', () => {
    it('unmounts after leave', () => {})
  })
})

function createUpdater(
  Component: React.ComponentType<{ args: [any, any, any?] }>
) {
  let result: RenderResult | undefined
  afterEach(() => {
    result = undefined
  })

  type Args = [any, UseTransitionProps, any[]?]
  return (...args: Args) => {
    const elem = <Component args={args} />
    if (result) result.rerender(elem)
    else result = render(elem)
    return result
  }
}
