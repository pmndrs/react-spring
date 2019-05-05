import { assert, test, _ } from 'spec.ts';
import { Spring, animated, SpringValue } from '../web';
import React from 'react';

const View = animated('div');

test('basic usage', () => {
  <Spring
    from={{ opacity: 0 }}
    to={{ opacity: 1, color: 'blue' }}
    onRest={values => {
      assert(values, _ as Readonly<{
        [key: string]: unknown;
        // FIXME: should include "opacity" and "color"
      }>);
    }}>
    {props => {
      assert(props, _ as {
        [key: string]: SpringValue<any>;
        // FIXME: should include "opacity" and "color"
      });
      return <View style={props} />;
    }}
  </Spring>;
});
