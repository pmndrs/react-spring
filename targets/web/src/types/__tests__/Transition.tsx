import * as React from 'react';
import { assert, test, _ } from 'spec.ts';
import { SpringValues, Transition, TransitionState } from '@react-spring/core';
import { animated } from '../..';

const View = animated('div');

const items = [1, 2] as [1, 2];

test('basic usage', () => {
  <Transition
    items={items}
    from={{ opacity: 0 }}
    enter={{ opacity: 1 }}
    leave={{ opacity: 0 }}>
    {(style, item, state, index) => {
      assert(style, _ as SpringValues); // FIXME: should include "opacity"
      assert(item, _ as 1 | 2);
      assert(state, _ as TransitionState<typeof item>);
      assert(index, _ as number);
      return <View style={style}>{item}</View>;
    }}
  </Transition>;
});
