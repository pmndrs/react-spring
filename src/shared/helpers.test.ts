import { interpolateTo } from './helpers'

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
    const excludeProps = {
      onRest: undefined,
      onFrame: undefined,
      children: undefined,
      reset: undefined,
      reverse: undefined,
      force: undefined,
      immediate: undefined,
      delay: undefined,
      attach: undefined,
      destroyed: undefined,
      interpolateTo: undefined,
      ref: undefined,
      lazy: undefined,
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
