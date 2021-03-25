import { inferTo } from './helpers'
import { ReservedProps } from './types/props'

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
      onPause: undefined,
      onResume: undefined,
      onRest: undefined,
      onResolve: undefined,
      onDestroyed: undefined,
      keys: undefined,
      callId: undefined,
      parentId: undefined,
    }
    expect(
      inferTo({
        ...forwardProps,
        ...restProps,
        ...excludeProps,
      })
    ).toMatchObject({
      ...restProps,
      ...excludeProps,
    })
  })
})
