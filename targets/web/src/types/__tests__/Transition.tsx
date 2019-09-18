import React from 'react';
import { assert, test, _ } from 'spec.ts';
import { Transition, animated, SpringValue, TransitionPhase } from '../..';
import { SpringValues } from '@react-spring/core';

const View = animated('div');

const items = [1, 2] as [1, 2];

test('basic usage', () => {
  <Transition
    items={items}
    enter={{ opacity: 1, color: 'blue' }}
    leave={{ opacity: 0 }}>
    {(item, phase, i) => props => {
      assert(props, _ as SpringValues); // FIXME: should include "opacity" and "color"
      assert(item, _ as 1 | 2);
      assert(phase, _ as TransitionPhase);
      assert(i, _ as number);
      return <View style={props}>{item}</View>;
    }}
  </Transition>;
});
