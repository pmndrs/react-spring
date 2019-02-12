import React, { forwardRef } from 'react'
import { cleanup, render } from 'react-testing-library'
import animated from './createAnimatedComponent'

afterEach(cleanup)

describe('animated component', () => {
  it('can create a new element from a string', () => {
    const AnimatedH1 = animated('h1')
    const { container } = render(<AnimatedH1 title="Foo">Bar</AnimatedH1>)
    expect(container.textContent).toBe('Bar')
    expect(container.querySelector('h1')!.title).toBe('Foo')
  })

  it('can create a new element from a component', () => {
    const Name = forwardRef<
      HTMLHeadingElement,
      { name: string; children: React.ReactNode }
    >((props, ref) => (
      <h2 title={props.name} ref={ref}>
        {props.children}
      </h2>
    ))
    const AnimatedName = animated(Name)
    const { container } = render(<AnimatedName name="Foo">Bar</AnimatedName>)
    expect(container.textContent).toBe('Bar')
    expect(container.querySelector('h2')!.title).toBe('Foo')
  })
})
