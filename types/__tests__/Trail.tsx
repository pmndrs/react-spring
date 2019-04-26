import { assert, test, _ } from 'spec.ts';
import { Trail, animated, AnimatedValue } from '../web';
import React from 'react';

const View = animated('div');

declare const items: [1, 2];

test('basic usage', () => {
  <Trail items={items} from={{ opacity: 0 }} to={{ opacity: 1, color: 'blue' }}>
    {item => props => {
      assert(item, _ as 1 | 2);
      assert(props, _ as {
        [key: string]: AnimatedValue<any>;
        opacity: AnimatedValue<number>;
        color: AnimatedValue<string>;
      });
      return <View style={props}>{item}</View>;
    }}
  </Trail>;
});
