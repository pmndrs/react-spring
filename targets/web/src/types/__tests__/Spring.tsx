import React from 'react';
import { assert, test, _ } from 'spec.ts';
import { animated, Spring } from '../..';
import {
  AnimationResult,
  SpringValues,
  SpringUpdateFn,
  UnknownProps,
} from 'core';

const View = animated('div');

test('basic usage', () => {
  <Spring
    from={{ opacity: 0 }}
    to={{ opacity: 1, color: 'blue' }}
    onRest={result => {
      assert(
        result,
        _ as Readonly<
          AnimationResult<
            UnknownProps & {
              opacity?: number;
              color?: string;
            }
          >
        >
      );
    }}>
    {values => {
      assert(
        values,
        _ as SpringValues<{
          opacity: number;
          color: string;
        }>
      );
      return <View style={values} />;
    }}
  </Spring>;
});

test('with async function as "to" prop', () => {
  <Spring
    from={{ opacity: 0 }}
    to={async next => {
      assert(
        next,
        _ as SpringUpdateFn<{
          opacity: number;
        }>
      );
    }}>
    {values => {
      assert(
        values,
        _ as SpringValues<{
          opacity: number;
        }>
      );
      return <View style={values} />;
    }}
  </Spring>;
});

test('with array as "to" prop', () => {
  <Spring
    from={{ opacity: 0 }}
    to={[
      { opacity: 1 },
      {
        // Scripted animation inside an animation chain
        to: async next => {
          assert(
            next,
            _ as SpringUpdateFn<{
              opacity: number;
            }>
          );
        },
      },
    ]}>
    {values => {
      assert(
        values,
        _ as SpringValues<{
          opacity: number;
        }>
      );
      return <View style={values} />;
    }}
  </Spring>;
});
