import { interpolateTo, reconcileDeleted } from './helpers'
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
      delay: undefined,
      lazy: undefined,
      items: undefined,
      trail: undefined,
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

  describe('reconcileDeleted', () => {
    it('should handle simple cases', () => {
      expect(reconcileWrapper('1:2:', '1')).toEqual([1, 2])
      expect(reconcileWrapper(':2:1', '1')).toEqual([2, 1])
    })

    it('should handle multiple items', () => {
      expect(reconcileWrapper('1:4:|4:5:', '1|2|3')).toEqual([1, 4, 5, 2, 3])
      expect(reconcileWrapper('1:4:|3:5:', '1|2|3')).toEqual([1, 4, 2, 3, 5])
      expect(reconcileWrapper('1:4:|4:5:|5:6:|:7:1', '1')).toEqual([
        7,
        1,
        4,
        5,
        6,
      ])
    })

    it('should handle weird ordering of items', () => {
      expect(reconcileWrapper('4:5:|1:4:', '1|2|3')).toEqual([1, 4, 5, 2, 3])
      expect(reconcileWrapper('1:4:|:5:4', '1|2|3')).toEqual([1, 5, 4, 2, 3])
    })

    it('should handle interrupted chain', () => {
      expect(reconcileWrapper('5:3:|9:5:', '1|2|4')).toEqual([1, 2, 4, 3, 5])
    })

    it('should handle empty arrays', () => {
      expect(reconcileWrapper('1:4:|4:5:', '')).toEqual([4, 5])
      expect(reconcileWrapper('', '1|2')).toEqual([1, 2])
      expect(reconcileWrapper('', '')).toEqual([])
    })
  })
})

const reconcileWrapper = (
  deletedString: string,
  outString: string
): number[] => {
  return reconcileDeleted(makeItems(deletedString), makeItems(outString)).map(
    i => i.originalKey
  )
}

const makeItems = (input: string): any[] => {
  if (input === '') return []
  return input.split('|').map(item => {
    let [left, originalKey, right] = item.split(':').map(n => parseInt(n, 10))
    if (originalKey === undefined) {
      return { originalKey: left }
    }
    return { left, originalKey, right }
  })
}
