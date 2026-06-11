import { createHost } from './createHost'
import { AnimatedObject } from './AnimatedObject'

const hostConfig = {
  applyAnimatedValues: () => false,
  createAnimatedStyle: (style: object) => new AnimatedObject(style),
  getComponentProps: (props: object) => props,
}

describe('createHost', () => {
  it('caches the animated wrapper on the component itself', () => {
    function MyComponent() {
      return null
    }
    const { animated } = createHost({ MyComponent }, hostConfig)

    const A = animated(MyComponent)
    const B = animated(MyComponent)

    // Same wrapper is returned on repeated calls
    expect(A).toBe(B)
  })

  it('falls back to a WeakMap when the component is non-extensible', () => {
    function MyComponent() {
      return null
    }
    Object.preventExtensions(MyComponent)

    // Should not throw even though MyComponent is non-extensible
    const { animated } = createHost({ MyComponent }, hostConfig)

    const A = animated(MyComponent)
    expect(A).toBeDefined()

    // Calling again returns the same cached wrapper
    const B = animated(MyComponent)
    expect(A).toBe(B)
  })

  it('handles frozen components without throwing', () => {
    function MyComponent() {
      return null
    }
    Object.freeze(MyComponent)

    const { animated } = createHost({ MyComponent }, hostConfig)

    expect(() => animated(MyComponent)).not.toThrow()
    expect(animated(MyComponent)).toBeDefined()
  })

  it('sets displayName on the animated wrapper', () => {
    function NamedComponent() {
      return null
    }
    const { animated } = createHost({ NamedComponent }, hostConfig)

    const A = animated(NamedComponent)
    expect(A.displayName).toBe('Animated(NamedComponent)')
  })

  it('sets displayName on wrappers for non-extensible components', () => {
    function NamedComponent() {
      return null
    }
    Object.preventExtensions(NamedComponent)

    const { animated } = createHost({ NamedComponent }, hostConfig)
    const A = animated(NamedComponent)

    expect(A.displayName).toBe('Animated(NamedComponent)')
  })
})
