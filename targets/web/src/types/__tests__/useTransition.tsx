import React from 'react';
import { assert, test, _ } from 'spec.ts';
import { SpringValues } from '@react-spring/core';
import { animated, useTransition, SpringUpdateFn } from '../..';

const View = animated('div');

const items = [1, 2] as [1, 2];

test('infer animated from these props', () => {
  const transition = useTransition(items, {
    from: { a: 1 },
    enter: { b: 1 },
    leave: { c: 1 },
    update: { d: 1 },
    initial: { e: 1 },
  });
  transition((style, item) => {
    assert(style, _ as SpringValues<{
      a: number;
      b: number;
      c: number;
      d: number;
      e: number;
    }>);
    assert(item, _ as 1 | 2);
    return null;
  });
});

test('basic usage', () => {
  const transition = useTransition(items, {
    from: { opacity: 0 },
    enter: [{ opacity: 1 }, { color: 'red' }],
    leave: { opacity: 0 },
  });

  // You typically map transition objects into JSX elements.
  return transition((style, item) => {
    assert(style, _ as SpringValues<{
      opacity?: number; // FIXME: "opacity" should never be undefined because it exists in "from"
      color?: string;
    }>);
    assert(item, _ as 1 | 2);
    return <View style={style}>{item}</View>;
  });
});

test('with function props', () => {
  const transition = useTransition(items, {
    from: item => {
      assert(item, _ as 1 | 2);
      return { width: 0, height: 0 };
    },
    enter: item => {
      assert(item, _ as 1 | 2);
      return { width: item * 100, height: '100%' };
    },
    leave: { width: '0%', opacity: 0 },
  });
  transition((style, item) => {
    assert(style, _ as SpringValues<{
      width: string | number;
      height: string;
      opacity: number;
    }>);
    assert(item, _ as 1 | 2);
    return null;
  });

  test('return an async function', () => {
    useTransition(items, {
      update: item => async next => {
        assert(item, _ as 1 | 2);
        assert(next, _ as SpringUpdateFn); // FIXME: should be "SpringUpdateFn<{ opacity: number, ... }>"
      },
    });
  });
});
