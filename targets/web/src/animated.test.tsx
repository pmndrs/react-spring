import * as React from 'react'
import { forwardRef } from 'react'
import { render } from 'vitest-browser-react'
import createMockRaf, { MockRaf } from '@react-spring/mock-raf'
import { FluidValue, Globals, callFluidObservers } from '@react-spring/shared'
import { SpringValue, Animatable } from '@react-spring/core'

import { a } from './index'

let mockRaf: MockRaf
beforeEach(() => {
  mockRaf = createMockRaf()
  Globals.assign({
    now: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
  })
})

describe('animated component', () => {
  it('creates an HTML element from a tag name', async () => {
    const AnimatedH1 = a('h1')
    const { getByTitle } = await render(
      <AnimatedH1 title="Foo" style={{ color: 'red' }}>
        Bar
      </AnimatedH1>
    )
    expect(getByTitle('Foo').element()).toBeTruthy()
  })
  it('wraps a component', async () => {
    const Name = forwardRef<
      HTMLHeadingElement,
      { name: string; other: string; children: React.ReactNode }
    >((props, ref) => (
      <h2 title={props.name} ref={ref}>
        {props.children}
      </h2>
    ))
    const AnimatedName = a(Name)
    const child = spring('Animated Text')
    const name = spring('name')
    const { getByTitle } = await render(
      <AnimatedName name={name} other="test">
        {child}
      </AnimatedName>
    )
    const el = getByTitle('name').element() as HTMLElement
    expect(el).toBeTruthy()
    expect(el.textContent).toBe('Animated Text')
  })
  it('accepts Animated values in style prop', async () => {
    const opacity = spring(0)
    const { getByText } = await render(
      <a.div style={{ opacity, color: 'red' }}>Text</a.div>
    )
    const div = getByText('Text').element() as HTMLElement
    expect(div).toBeTruthy()
    expect(div.style.opacity).toBe('0')
    opacity.set(1)
    mockRaf.step()
    expect(div.style.opacity).toBe('1')
  })
  it('accepts Animated values in custom style prop', async () => {
    const Name = forwardRef<
      HTMLHeadingElement,
      { style: { color: string; opacity?: number }; children: React.ReactNode }
    >((props, ref) => (
      <h2 ref={ref} style={props.style}>
        {props.children}
      </h2>
    ))
    const AnimatedName = a(Name)
    const opacity = spring(0.5)
    const { getByText } = await render(
      <AnimatedName
        style={{
          opacity: opacity,
          color: 'red',
        }}
      >
        Text
      </AnimatedName>
    )
    const div = getByText('Text').element() as HTMLElement
    expect(div).toBeTruthy()
    expect(div.style.opacity).toBe('0.5')
    opacity.set(1)
    mockRaf.step()
    expect(div.style.opacity).toBe('1')
  })
  it('accepts scrollTop and scrollLeft properties', async () => {
    const scrollTop = spring(0)
    const { getByTestId } = await render(
      <a.div
        scrollTop={scrollTop}
        scrollLeft={0}
        style={{ height: 100, overflow: 'auto' }}
        data-testid="wrapper"
      >
        <div style={{ height: 200 }} />
      </a.div>
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.scrollTop).toBe(0)
    expect(wrapper.scrollLeft).toBe(0)
    scrollTop.set(20)
    mockRaf.step()
    expect(wrapper.scrollTop).toBe(20)
  })
  it('accepts the className property', async () => {
    const className = spring('test')
    const { getByTestId } = await render(
      <a.div className={className} data-testid="wrapper" />
    )
    expect(getByTestId('wrapper').element().className).toBe('test')
    className.set('new')
    mockRaf.step()
    expect(getByTestId('wrapper').element().className).toBe('new')
  })
  it('accepts x/y/z as style keys equivalent to `translate3d`transform function', async () => {
    const { getByTestId, rerender } = await render(
      <a.div style={{ x: 10 }} data-testid="wrapper" />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe('translate3d(10px, 0px, 0px)')
    await rerender(<a.div style={{ y: '10%' }} data-testid="wrapper" />)
    expect(wrapper.style.transform).toBe('translate3d(0px, 10%, 0px)')
    await rerender(<a.div style={{ z: 0.3 }} data-testid="wrapper" />)
    expect(wrapper.style.transform).toBe('translate3d(0px, 0px, 0.3px)')
    await rerender(
      <a.div style={{ x: 10, y: '10%', z: 0.3 }} data-testid="wrapper" />
    )
    expect(wrapper.style.transform).toBe('translate3d(10px, 10%, 0.3px)')
  })
  it('accepts arrays for transform functions used as style keys', async () => {
    const { getByTestId } = await render(
      <a.div style={{ scale: [1, 2] }} data-testid="wrapper" />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe('scale(1, 2)')
  })
  it('accepts Animated values or Animated arrays as attributes', async () => {
    const scale = spring(2)
    const translate = spring([10, 20] as const)
    const translate3d = [spring(30), spring(40), '50px'] as const
    const { getByTestId } = await render(
      <a.div style={{ scale, translate, translate3d }} data-testid="wrapper" />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe(
      'scale(2) translate(10px, 20px) translate3d(30px, 40px, 50px)'
    )
  })
  it('updates all values of Animated arrays', async () => {
    const translate3d = spring([10, 20, 30] as const)
    const { getByTestId } = await render(
      <a.div style={{ translate3d }} data-testid="wrapper" />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe('translate3d(10px, 20px, 30px)')
    translate3d.set([11, 21, 31] as const)
    mockRaf.step()
    expect(wrapper.style.transform).toBe('translate3d(11px, 21px, 31px)')
  })
  it('sets default units to unit-less values passed as transform functions', async () => {
    const { getByTestId } = await render(
      <a.div
        style={{
          x: 10,
          scale: [1, 2],
          rotate: 30,
          skewX: 10,
          transform: 'translateX(10px)',
        }}
        data-testid="wrapper"
      />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe(
      'translate3d(10px, 0px, 0px) scale(1, 2) rotate(30deg) skewX(10deg) translateX(10px)'
    )
  })
  it('only applies default units to the fourth value of `rotate3d`', async () => {
    const { getByTestId } = await render(
      <a.div style={{ rotate3d: [1, 0, 0, 30] }} data-testid="wrapper" />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe('rotate3d(1, 0, 0, 30deg)')
  })
  it('applies `transform:none` when identity transform is detected', async () => {
    const z = spring(0)
    const { getByTestId } = await render(
      <a.div
        style={{
          x: 0,
          y: '0px',
          z,
          scale: 1,
          skewX: 0,
          transformOrigin: 'bottom center',
          rotate3d: [1, 0, 0, '0deg'],
        }}
        data-testid="wrapper"
      />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe('none')
  })
  it('does not treat custom spring keys that start with transform-function names as transforms', async () => {
    // Issue #1912: user-defined interpolation keys like `scale3dValue` or
    // `translateY_v2` were hijacked by the `^scale` / `^translate` prefix
    // match in `AnimatedStyle`, corrupting the composed `transform`.
    const scale3dValue = spring(0.5)
    const { getByTestId } = await render(
      <a.div
        style={
          {
            scale3dValue,
            transform: 'rotate(45deg)',
          } as React.CSSProperties
        }
        data-testid="wrapper"
      />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transform).toBe('rotate(45deg)')
  })
  it('preserves transform-style and transform-origin properties', async () => {
    const { getByTestId } = await render(
      <a.div
        style={{
          transformOrigin: 'bottom center',
          transformStyle: 'preserve-3d',
          transform: 'translateX(40px)',
          scale: [1, 2],
        }}
        data-testid="wrapper"
      />
    )
    const wrapper = getByTestId('wrapper').element() as HTMLElement
    expect(wrapper.style.transformOrigin).toBe('center bottom')
    expect(wrapper.style.transformStyle).toBe('preserve-3d')
    expect(wrapper.style.transform).toBe('translateX(40px) scale(1, 2)')
  })
})

describe('animated component attribute removal', () => {
  it('removes a boolean-style attribute when its animated value becomes undefined', async () => {
    const inert = new TestFluid<true | undefined>(true)
    const { getByTestId } = await render(
      <a.div inert={inert as any} data-testid="wrapper" />
    )
    const el = getByTestId('wrapper').element() as HTMLElement
    expect(el.hasAttribute('inert')).toBe(true)
    inert.set(undefined)
    mockRaf.step()
    expect(el.hasAttribute('inert')).toBe(false)
  })
  it('removes a generic attribute when its animated value becomes undefined', async () => {
    const value = new TestFluid<string | undefined>('bar')
    const { getByTestId } = await render(
      <a.div data-foo={value as any} data-testid="wrapper" />
    )
    const el = getByTestId('wrapper').element() as HTMLElement
    expect(el.getAttribute('data-foo')).toBe('bar')
    value.set(undefined)
    mockRaf.step()
    expect(el.hasAttribute('data-foo')).toBe(false)
  })
  it('removes the viewBox attribute when its animated value becomes undefined', async () => {
    const viewBox = new TestFluid<string | undefined>('0 0 100 100')
    const { getByTestId } = await render(
      <a.svg viewBox={viewBox as any} data-testid="wrapper" />
    )
    const el = getByTestId('wrapper').element() as unknown as SVGSVGElement
    expect(el.getAttribute('viewBox')).toBe('0 0 100 100')
    viewBox.set(undefined)
    mockRaf.step()
    expect(el.hasAttribute('viewBox')).toBe(false)
  })
  it('removes the class attribute when className becomes undefined', async () => {
    const className = new TestFluid<string | undefined>('initial')
    const { getByTestId } = await render(
      <a.div className={className as any} data-testid="wrapper" />
    )
    const el = getByTestId('wrapper').element() as HTMLElement
    expect(el.getAttribute('class')).toBe('initial')
    className.set(undefined)
    mockRaf.step()
    expect(el.hasAttribute('class')).toBe(false)
  })
  it('clears textContent when children becomes undefined', async () => {
    const children = new TestFluid<string | undefined>('hello')
    const { getByTestId } = await render(
      <a.div data-testid="wrapper">{children as any}</a.div>
    )
    const el = getByTestId('wrapper').element() as HTMLElement
    expect(el.textContent).toBe('hello')
    children.set(undefined)
    mockRaf.step()
    expect(el.textContent).toBe('')
  })
  it('still applies defined falsy attribute values rather than removing them', async () => {
    const value = new TestFluid<string>('1')
    const { getByTestId } = await render(
      <a.div tabIndex={value as any} data-testid="wrapper" />
    )
    const el = getByTestId('wrapper').element() as HTMLElement
    expect(el.getAttribute('tabindex')).toBe('1')
    value.set('0')
    mockRaf.step()
    expect(el.getAttribute('tabindex')).toBe('0')
    expect(el.hasAttribute('tabindex')).toBe(true)
  })
})

function spring<T>(value: T): SpringValue<Animatable<T>> {
  return new SpringValue(value!)
}

class TestFluid<T> extends FluidValue<T> {
  constructor(private _value: T) {
    super()
  }
  protected get(): T {
    return this._value
  }
  set(next: T): void {
    this._value = next
    callFluidObservers(this, { type: 'change', parent: this })
  }
}
