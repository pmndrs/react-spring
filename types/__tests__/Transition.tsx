import { assert, test, _ } from 'spec.ts';
import { Transition, animated, AnimatedValue, TransitionPhase } from '../web';
import React from 'react';

const View = animated('div');

const items = [1, 2] as [1, 2];

test('basic usage', () => {
  <Transition
    items={items}
    enter={{ opacity: 1, color: 'blue' }}
    leave={{ opacity: 0 }}>
    {(item, phase, i) => props => {
      assert(props, _ as {
        [key: string]: AnimatedValue<any>;
        opacity: AnimatedValue<number>;
        color: AnimatedValue<string>;
      });
      assert(item, _ as 1 | 2);
      assert(phase, _ as TransitionPhase);
      assert(i, _ as number);
      return <View style={props}>{item}</View>;
    }}
  </Transition>;
});
