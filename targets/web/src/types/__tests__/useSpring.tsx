import { assert, test, _ } from 'spec.ts';
import React, { useRef } from 'react';
import { SpringValues, AnimationResult } from 'core';
import { UnknownPartial } from 'shared';
import { RunAsyncProps } from '@react-spring/core/src/runAsync';
import {
  animated,
  useSpring,
  SpringValue,
  SpringHandle,
  SpringStopFn,
  SpringUpdateFn,
} from '../..';

test('infer return type via forward prop', () => {
  const props = useSpring({ width: 0, delay: 1000 });
  assert(props, _ as SpringValues<{
    width: number;
  }>);

  test('using with "animated()" component', () => {
    const Test = animated((_: { style: { width: number } }) => null);
    return <Test style={props} />;
  });
});

test('infer return type via "from" prop', () => {
  const props = useSpring({
    from: { width: 0 },
  });
  assert(props, _ as SpringValues<{
    width: number;
  }>);
});

test('infer return type via "to" prop', () => {
  const props = useSpring({
    to: { width: 0 },
  });
  assert(props, _ as SpringValues<{
    width: number;
  }>);
});

test('infer return type via "from" and "to" props', () => {
  const props = useSpring({
    from: { width: 0 },
    to: { height: '100%' },
  });
  assert(props, _ as SpringValues<{
    width: number;
    height: string;
  }>);
});

test('infer return type via "from" and forward props', () => {
  const props = useSpring({
    from: { width: 0 },
    height: '100%',
  });
  assert(props, _ as SpringValues<{
    width: number;
    height: string;
  }>);
});

test('infer animated array', () => {
  const props = useSpring({
    to: { foo: [0, 0] },
  });
  assert(props, _ as SpringValues<{
    foo: number[];
  }>);

  test('interpolated array', () => {
    props.foo.interpolate((a, b) => {
      assert(a, _ as number);
      assert(b, _ as number);
      return 0;
    });
  });
});

test('imperative mode', () => {
  const [props, update, stop] = useSpring(() => ({
    foo: 0,
    onRest(event) {
      assert(event, _ as AnimationResult<unknown>);
    },
  }));

  type Foo = { foo: number };
  assert(props, _ as SpringValues<Foo>);
  assert(update, _ as SpringUpdateFn<Foo>);
  assert(stop, _ as SpringStopFn<Foo>);

  test('update()', () => {
    // Update an existing animated key
    update({ foo: 100 });

    // Add an animated key
    update({ bar: 100 });

    // With event listener
    update({
      onRest(result) {
        assert(result, _ as AnimationResult<unknown>);
      },
    });
  });

  test('stop()', () => {
    stop();
    stop('foo');
    stop(['foo', 'bar']);
  });

  test('with delay and reset', () => {
    const [props] = useSpring(() => ({
      foo: 0,
      delay: 1000,
      reset: true,
    }));
    assert(props, _ as SpringValues<{
      foo: number;
    }>);
  });

  test('with callbacks', () => {
    const [props] = useSpring(() => ({
      foo: 0,
      onStart(spring) {
        assert(spring, _ as SpringValue<unknown>);
      },
      onFrame(values) {
        assert(values, _ as UnknownPartial<{
          // FIXME: should include this
          // foo: number
        }>);
      },
      onRest(result) {
        assert(result, _ as AnimationResult<unknown>);
      },
    }));
    assert(props, _ as SpringValues<{
      foo: number;
    }>);
  });
});

test('spring refs', () => {
  const ref = useRef<SpringHandle>(null);
  useSpring({ foo: 1, ref });
  ref.current!.start();
  ref.current!.stop(['foo', 'bar']);
  ref.current!.stop();
});

test('basic config', () => {
  const props = useSpring({
    from: { width: 0 },
    reset: true,
    delay: 1000,
    onStart(spring) {
      assert(spring, _ as SpringValue<unknown>);
    },
    onFrame(values) {
      assert(values, _ as UnknownPartial<{
        // FIXME: should include this
        // width: number
      }>);
    },
    onRest(result) {
      assert(result, _ as AnimationResult<unknown>);
    },
  });
  assert(props, _ as SpringValues<{
    width: number;
  }>);
});

test('function as "to" prop', () => {
  const props = useSpring({
    to: async next => {
      assert(next, _ as SpringUpdateFn<{}>);

      // Unknown keys can be animated.
      await next({ width: '100%' });

      await next({
        foo: 100,
        delay: 1000,
        config: { duration: 1000 },
        onRest(result) {
          assert(result, _ as AnimationResult<unknown>);
        },
      });
    },
  });
  assert(props, _ as SpringValues);

  test('with "from" prop', () => {
    const props = useSpring({
      from: { foo: 1 },
      to: async next => {
        assert(next, _ as SpringUpdateFn<{
          // FIXME: should include this
          // foo: number
        }>);
        await next({
          onRest(result) {
            assert(result, _ as AnimationResult<unknown>); // FIXME: should be "UnknownProps & { foo: number }"
          },
        });
      },
    });
    assert(props, _ as SpringValues<{
      foo: number;
    }>);
  });
});

test('array as "to" prop', () => {
  // ⚠️ Animated keys are not inferred when "to" is an array (unless "from" exists)
  const props = useSpring({
    to: [{ opacity: 1 }, { opacity: 0 }],
    foo: 0, // ️️⚠️ This key is ignored because "to" exists
  });
  assert(props, _ as SpringValues<{
    opacity: number;
  }>);

  test('with "from" prop', () => {
    const props = useSpring({
      to: [{ opacity: 1 }, { opacity: 0 }],
      from: { opacity: 0 },
    });
    assert(props, _ as SpringValues<{
      opacity: number;
    }>);
  });
});

test('with "onAnimate" prop', () => {
  useSpring({
    width: 0,
    onAnimate(props, spring) {
      assert(props, _ as RunAsyncProps<unknown>);
      assert(spring, _ as SpringValue<unknown>);
    },
  });
});
