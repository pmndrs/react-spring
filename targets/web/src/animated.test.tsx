import React, { forwardRef } from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import createMockRaf, { MockRaf } from 'mock-raf'
import { FrameLoop, SpringValue, Animatable } from '@react-spring/core'
import { a } from '.'
import * as Globals from 'shared/globals'

afterEach(cleanup)

let mockRaf: MockRaf
beforeEach(() => {
  mockRaf = createMockRaf()
  Globals.assign({
    performanceNow: mockRaf.now,
    requestAnimationFrame: mockRaf.raf,
    cancelAnimationFrame: mockRaf.cancel,
    frameLoop: new FrameLoop(),
  })
})

describe('animated component', () => {
  it('creates an HTML element from a tag name', () => {
    const AnimatedH1 = a('h1')
    const { queryByTitle } = render(
      <AnimatedH1 title="Foo" style={{ color: 'red' }}>
        Bar
      </AnimatedH1>
    )
    expect(queryByTitle('Foo')).toBeTruthy()
  })

  it('wraps a component', () => {
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
    const { queryByTitle } = render(
      <AnimatedName name={name} other="test">
        {child}
      </AnimatedName>
    )
    const el: any = queryByTitle('name')!
    expect(el).toBeTruthy()
    expect(el.textContent).toBe('Animated Text')
  })

  it('accepts Animated values in style prop', () => {
    const opacity = spring(0)
    const { queryByText } = render(
      <a.div style={{ opacity, color: 'red' }}>Text</a.div>
    )
    const div: any = queryByText('Text')!
    expect(div).toBeTruthy()
    expect(div.style.opacity).toBe('0')
    opacity.set(1)
    mockRaf.step()
    expect(div.style.opacity).toBe('1')
  })

  it('accepts Animated values in custom style prop', () => {
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
    const { queryByText } = render(
      <AnimatedName
        style={{
          opacity: opacity,
          color: 'red',
        }}>
        Text
      </AnimatedName>
    )
    const div: any = queryByText('Text')!
    expect(div).toBeTruthy()
    expect(div.style.opacity).toBe('0.5')
    opacity.set(1)
    mockRaf.step()
    expect(div.style.opacity).toBe('1')
  })

  it('accepts scrollTop and scrollLeft properties', () => {
    const scrollTop = spring(0)
    const { queryByTestId } = render(
      <a.div
        scrollTop={scrollTop}
        scrollLeft={0}
        style={{ height: 100 }}
        data-testid="wrapper">
        <div style={{ height: 200 }} />
      </a.div>
    )
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.scrollTop).toBe(0)
    expect(wrapper.scrollLeft).toBe(0)
    scrollTop.set(20)
    mockRaf.step()
    expect(wrapper.scrollTop).toBe(20)
  })

  it('accepts x/y/z as style keys equivalent to `translate3d`transform function', () => {
    const { queryByTestId, rerender } = render(
      <a.div style={{ x: 10 }} data-testid="wrapper" />
    )
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transform).toBe('translate3d(10px,0,0)')
    rerender(<a.div style={{ y: '10%' }} data-testid="wrapper" />)
    expect(wrapper.style.transform).toBe('translate3d(0,10%,0)')
    rerender(<a.div style={{ z: 0.3 }} data-testid="wrapper" />)
    expect(wrapper.style.transform).toBe('translate3d(0,0,0.3px)')
    rerender(
      <a.div style={{ x: 10, y: '10%', z: 0.3 }} data-testid="wrapper" />
    )
    expect(wrapper.style.transform).toBe('translate3d(10px,10%,0.3px)')
  })

  it('accepts arrays for transform functions used as style keys', () => {
    const { queryByTestId } = render(
      <a.div style={{ scale: [1, 2] }} data-testid="wrapper" />
    )
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transform).toBe('scale(1,2)')
  })

  it('accepts Animated values or Animated arrays as attributes', () => {
    const scale = spring(2)
    const translate = spring([10, 20] as const)
    const translate3d = [spring(30), spring(40), '50px'] as const

    const { queryByTestId } = render(
      <a.div style={{ scale, translate, translate3d }} data-testid="wrapper" />
    )
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transform).toBe(
      'scale(2) translate(10px,20px) translate3d(30px,40px,50px)'
    )
  })

  it('sets default units to unit-less values passed as transform functions', () => {
    const { queryByTestId } = render(
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
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transform).toBe(
      'translate3d(10px,0,0) scale(1,2) rotate(30deg) skewX(10deg) translateX(10px)'
    )
  })

  it('only applies default units to the fourth value of `rotate3d`', () => {
    const { queryByTestId } = render(
      <a.div style={{ rotate3d: [1, 0, 0, 30] }} data-testid="wrapper" />
    )
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transform).toBe('rotate3d(1,0,0,30deg)')
  })

  it('applies `transform:none` when identity transform is detected', () => {
    const z = spring(0)
    const { queryByTestId } = render(
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
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transform).toBe('none')
  })

  it('preserves transform-style and transform-origin properties', () => {
    const { queryByTestId } = render(
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
    const wrapper: any = queryByTestId('wrapper')!
    expect(wrapper.style.transformOrigin).toBe('bottom center')
    expect(wrapper.style.transformStyle).toBe('preserve-3d')
    expect(wrapper.style.transform).toBe('translateX(40px) scale(1,2)')
  })
})

function spring<T>(value: T): SpringValue<Animatable<T>> {
  return new SpringValue('value').update({ from: { value } })
}
