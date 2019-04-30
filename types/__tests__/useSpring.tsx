import { assert, test, _ } from 'spec.ts';
import React, { useRef } from 'react';
import { UnknownProps } from '../lib/common';
import {
  animated,
  useSpring,
  AnimatedValue,
  SpringHandle,
  SpringStopFn,
  SpringUpdateFn,
} from '../web';

test('infer return type via forward prop', () => {
  const props = useSpring({ width: 0 });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    width: AnimatedValue<number>;
  });

  test('using with "animated()" component', () => {
    const Test = animated((_: { style: { width: number } }) => null);
    return <Test style={props} />;
  });
});

test('infer return type via "from" prop', () => {
  const props = useSpring({
    from: { width: 0 },
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    width: AnimatedValue<number>;
  });
});

test('infer return type via "to" prop', () => {
  const props = useSpring({
    to: { width: 0 },
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    width: AnimatedValue<number>;
  });
});

test('infer return type via "from" and "to" props', () => {
  const props = useSpring({
    from: { width: 0 },
    to: { height: '100%' },
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    width: AnimatedValue<number>;
    height: AnimatedValue<string>;
  });
});

test('infer return type via "from" and forward props', () => {
  const props = useSpring({
    from: { width: 0 },
    height: '100%',
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    width: AnimatedValue<number>;
    height: AnimatedValue<string>;
  });
});

test('infer animated array', () => {
  const props = useSpring({
    to: { foo: [0, 0] },
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    foo: AnimatedValue<number[]>;
  });

  test('interpolated array', () => {
    props.foo.interpolate((a, b) => {
      assert(a, _ as number);
      assert(b, _ as number);
    });
  });
});

test('imperative mode', () => {
  const [props, update, stop] = useSpring(() => ({
    foo: 0,
    onRest(values) {
      assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { foo: number }"
    },
  }));
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    foo: AnimatedValue<number>;
  });
  assert(update, _ as SpringUpdateFn<{ foo: number }>);
  assert(stop, _ as SpringStopFn);

  test('update()', () => {
    // Update an existing animated key
    update({ foo: 100 });

    // Add an animated key
    update({ bar: 100 });

    // With event listener
    update({
      onRest(values) {
        assert(values, _ as Readonly<{
          [key: string]: unknown;
          foo: number;
        }>);
      },
    });
  });

  test('stop()', () => {
    stop();
    stop(true);
    stop(true, 'foo');
    stop('foo');
    stop('foo', 'bar');
  });

  test('with delay and reset', () => {
    const [props] = useSpring(() => ({
      foo: 0,
      delay: 1000,
      reset: true,
    }));
    assert(props, _ as {
      [key: string]: AnimatedValue<any>;
      foo: AnimatedValue<number>;
    });
  });

  test('with callbacks', () => {
    const [props] = useSpring(() => ({
      foo: 0,
      onStart(anim) {
        assert(anim, _ as any);
      },
      onFrame(values) {
        assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { foo: number }"
      },
      onRest(values) {
        assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { foo: number }"
      },
    }));
    assert(props, _ as {
      [key: string]: AnimatedValue<any>;
      foo: AnimatedValue<number>;
    });
  });
});

test('spring refs', () => {
  const ref = useRef<SpringHandle>(null);
  useSpring({ foo: 1, ref });
  ref.current!.start();
  ref.current!.stop(true, 'foo', 'bar');
  ref.current!.stop();
});

test('basic config', () => {
  const props = useSpring({
    from: { width: 0 },
    reset: true,
    delay: 1000,
    onStart(animation) {
      assert(animation, _ as any);
    },
    onFrame(values) {
      assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { width: number }"
    },
    onRest(values) {
      assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { width: number }"
    },
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    width: AnimatedValue<number>;
  });
});

test('function as "to" prop', () => {
  const props = useSpring({
    to: async next => {
      assert(next, _ as SpringUpdateFn);

      // Unknown keys can be animated.
      await next({ width: '100%' });

      await next({
        foo: 100,
        delay: 1000,
        config: { duration: 1000 },
        onRest(values) {
          assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { foo: number }"
        },
      });
    },
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
  });

  test('with "from" prop', () => {
    const props = useSpring({
      from: { foo: 1 },
      to: async next => {
        assert(next, _ as SpringUpdateFn); // FIXME: should be "SpringUpdateFn<{ foo: number }>"
        await next({
          onRest(values) {
            assert(values, _ as Readonly<UnknownProps>); // FIXME: should be "UnknownProps & { foo: number }"
          },
        });
      },
    });
    assert(props, _ as {
      [key: string]: AnimatedValue<any>;
      foo: AnimatedValue<number>;
    });
  });
});

test('array as "to" prop', () => {
  // ⚠️ Animated keys are not inferred when "to" is an array (unless "from" exists)
  const props = useSpring({
    to: [{ opacity: 1 }, { opacity: 0 }],
    foo: 0, // ️️⚠️ This key is ignored because "to" exists
  });
  assert(props, _ as {
    [key: string]: AnimatedValue<any>;
    opacity: AnimatedValue<number>;
  });

  test('with "from" prop', () => {
    const props = useSpring({
      to: [{ opacity: 1 }, { opacity: 0 }],
      from: { opacity: 0 },
    });
    assert(props, _ as {
      [key: string]: AnimatedValue<any>;
      opacity: AnimatedValue<number>;
    });
  });
});
