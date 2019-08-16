import React, { forwardRef } from 'react';
import { cleanup, render } from 'react-testing-library';
import { AnimatedValue } from '@react-spring/animated';
import { SpringValue } from '@react-spring/core';
import { animated } from '../..';

afterEach(cleanup);

describe('animated component', () => {
  it('creates an HTML element from a tag name', () => {
    const AnimatedH1 = animated('h1');
    const { queryByTitle } = render(
      <AnimatedH1 title="Foo" style={{ color: 'red' }}>
        Bar
      </AnimatedH1>
    );
    expect(queryByTitle('Foo')).toBeTruthy();
  });

  it('wraps a component', () => {
    const Name = forwardRef<
      HTMLHeadingElement,
      { name: string; other: string; children: React.ReactNode }
    >((props, ref) => (
      <h2 title={props.name} ref={ref}>
        {props.children}
      </h2>
    ));
    const AnimatedName = animated(Name);
    const child = new AnimatedValue('Animated Text');
    const name = new AnimatedValue('name');
    const { queryByTitle } = render(
      <AnimatedName name={name as SpringValue<string>} other="test">
        {child}
      </AnimatedName>
    );
    const el: any = queryByTitle('name')!;
    expect(el).toBeTruthy();
    expect(el.textContent).toBe('Animated Text');
  });

  it('accepts Animated values in style prop', () => {
    const AnimatedDiv = animated('div');
    const opacity = new AnimatedValue<number>(0);
    const { queryByText } = render(
      <AnimatedDiv style={{ opacity, color: 'red' }}>Text</AnimatedDiv>
    );
    const div: any = queryByText('Text')!;
    expect(div).toBeTruthy();
    expect(div.style.opacity).toBe('0');
    opacity.setValue(1);
    expect(div.style.opacity).toBe('1');
  });

  it('accepts Animated values in custom style prop', () => {
    const Name = forwardRef<
      HTMLHeadingElement,
      { style: { color: string; opacity?: number }; children: React.ReactNode }
    >((props, ref) => (
      <h2 ref={ref} style={props.style}>
        {props.children}
      </h2>
    ));
    const AnimatedName = animated(Name);
    const opacity = new AnimatedValue(0.5);
    const { queryByText } = render(
      <AnimatedName
        style={{
          opacity: opacity,
          color: 'red',
        }}>
        Text
      </AnimatedName>
    );
    const div: any = queryByText('Text')!;
    expect(div).toBeTruthy();
    expect(div.style.opacity).toBe('0.5');
    opacity.setValue(1);
    expect(div.style.opacity).toBe('1');
  });

  it('accepts scrollTop and scrollLeft properties', () => {
    const AnimatedDiv = animated('div');
    const scrollTop = new AnimatedValue(0);
    const { queryByTestId } = render(
      <AnimatedDiv
        scrollTop={scrollTop as SpringValue<number>}
        scrollLeft={new AnimatedValue(0) as SpringValue<number>}
        style={{ height: 100 }}
        data-testid="wrapper">
        <div style={{ height: 200 }} />
      </AnimatedDiv>
    );
    const wrapper: any = queryByTestId('wrapper')!;
    expect(wrapper.scrollTop).toBe(0);
    expect(wrapper.scrollLeft).toBe(0);
    scrollTop.setValue(20);
    expect(wrapper.scrollTop).toBe(20);
  });

  it('accepts transform function and x/y/z as style keys', () => {
    const AnimatedDiv = animated('div');
    const { queryByTestId } = render(
      <AnimatedDiv style={{ x: 10 }} data-testid="wrapper"></AnimatedDiv>
    );
    const wrapper: any = queryByTestId('wrapper')!;
    expect(wrapper.style.transform).toBe('translate3d(10px,0,0)');
  });
});
