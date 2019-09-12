import { interpolateTo } from './helpers'
import { ReservedProps } from './types/common'

describe('helpers', () => {
  it('interpolateTo', () => {
    const forwardProps = {
      result: 'ok',
    }
    const restProps = {
      from: 'from',
      config: 'config',
      onStart: 'onStart',
    }
    const excludeProps: Required<ReservedProps> = {
      children: undefined,
      config: undefined,
      from: undefined,
      to: undefined,
      ref: undefined,
      reset: undefined,
      cancel: undefined,
      reverse: undefined,
      immediate: undefined,
      default: undefined,
      delay: undefined,
      lazy: undefined,
      items: undefined,
      trail: undefined,
      sort: undefined,
      expires: undefined,
      initial: undefined,
      enter: undefined,
      leave: undefined,
      update: undefined,
      onAnimate: undefined,
      onStart: undefined,
      onRest: undefined,
      onFrame: undefined,
    }
    expect(
      interpolateTo({
        ...forwardProps,
        ...restProps,
        ...excludeProps,
      })
    ).toMatchObject({
      to: forwardProps,
      ...restProps,
      ...excludeProps,
    })
  })
})
