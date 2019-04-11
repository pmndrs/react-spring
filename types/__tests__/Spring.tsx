import { assert, test, _ } from 'spec.ts';
import { Spring, animated, AnimatedValue } from '../web';
import React from 'react';

const View = animated('div');

test('basic usage', () => {
  <Spring
    from={{ opacity: 0 }}
    to={{ opacity: 1, color: 'blue' }}
    onRest={values => {
      assert(values, _ as {
        [key: string]: unknown;
        // FIXME: should include "opacity" and "color"
      });
    }}>
    {props => {
      assert(props, _ as {
        [key: string]: AnimatedValue<any>;
        // FIXME: should include "opacity" and "color"
      });
      return <View style={props} />;
    }}
  </Spring>;
});
