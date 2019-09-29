import { inferTo } from './helpers'
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
      loop: undefined,
      reset: undefined,
      pause: undefined,
      cancel: undefined,
      reverse: undefined,
      immediate: undefined,
      default: undefined,
      delay: undefined,
      items: undefined,
      trail: undefined,
      sort: undefined,
      expires: undefined,
      initial: undefined,
      enter: undefined,
      leave: undefined,
      update: undefined,
      onProps: undefined,
      onStart: undefined,
      onChange: undefined,
      onRest: undefined,
    }
    expect(
      inferTo({
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
