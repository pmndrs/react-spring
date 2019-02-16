import React, { forwardRef } from 'react'
import { cleanup, render } from 'react-testing-library'
import '../targets/web'
import AnimatedValue from './AnimatedValue'
import animated from './createAnimatedComponent'

afterEach(cleanup)

describe('animated component', () => {
  it('creates an HTML element from a tag name', () => {
    const AnimatedH1 = animated('h1')
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
      { name: string; children: React.ReactNode }
    >((props, ref) => (
      <h2 title={props.name} ref={ref}>
        {props.children}
      </h2>
    ))
    const AnimatedName = animated(Name)
    const { queryByTitle } = render(<AnimatedName name="Foo">Bar</AnimatedName>)
    expect(queryByTitle('Bar')).toBeTruthy()
  })

  it('accepts Animated values in style prop', () => {
    const AnimatedDiv = animated('div')
    const opacity = new AnimatedValue(0)
    const { queryByText } = render(
      <AnimatedDiv style={{ opacity: opacity, color: 'red' }}>Text</AnimatedDiv>
    )
    const div = queryByText('Text')!
    expect(div).toBeTruthy()
    expect(div.style.opacity).toBe('0')
    opacity.setValue(1)
    expect(div.style.opacity).toBe('1')
  })

  it('accepts scrollTop and scrollLeft properties', () => {
    const AnimatedDiv = animated('div')
    const scrollTop = new AnimatedValue(0)
    const { queryByTestId } = render(
      <AnimatedDiv
        scrollTop={scrollTop}
        scrollLeft={new AnimatedValue(0)}
        style={{ height: 100 }}
        data-testid="wrapper">
        <div style={{ height: 200 }} />
      </AnimatedDiv>
    )
    const wrapper = queryByTestId('wrapper')!
    expect(wrapper.scrollTop).toBe(0)
    expect(wrapper.scrollLeft).toBe(0)
    scrollTop.setValue(20)
    expect(wrapper.scrollTop).toBe(20)
  })
})
