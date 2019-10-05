import React from 'react';
import { assert, test, _ } from 'spec.ts';
import { animated, Trail } from '../..';
import { SpringValues } from 'core';

const View = animated('div');

declare const items: number[];

test('basic usage', () => (
  <Trail items={items} from={{ opacity: 0 }} to={{ opacity: 1, color: 'blue' }}>
    {item => props => {
      assert(item, _ as unknown); // FIXME: should be "number"
      assert(props, _ as SpringValues); // FIXME: should include "opacity" and "color"
      return <View style={props}>{String(item)}</View>;
    }}
  </Trail>
));
