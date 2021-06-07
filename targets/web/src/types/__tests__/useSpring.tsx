import * as React from 'react';
import { assert, test, _ } from 'spec.ts';
import { RunAsyncProps } from '@react-spring/core/src/runAsync';
import {
  animated,
  useSpring,
  SpringValue,
  SpringValues,
  SpringRef,
  AnimationResult,
} from '../..';

type State = { width: number };

test('infer return type via forward prop', () => {
  const props = useSpring({ width: 0, delay: 1000 });
  assert(props, _ as SpringValues<State>);

  test('using with "animated()" component', () => {
    const Test = animated((_: { style: State }) => null);
    return <Test style={props} />;
  });
});

test('infer return type via "from" prop', () => {
  const props = useSpring({ from: { width: 0 } });
  assert(props, _ as SpringValues<State>);
});

test('infer return type via "to" prop', () => {
  const props = useSpring({ to: { width: 0 } });
  assert(props, _ as SpringValues<State>);
});

test('infer return type via "from" and "to" props', () => {
  const props = useSpring({
    from: { width: 0 },
    to: { height: '100%' },
  });
  assert(
    props,
    _ as SpringValues<{
      width: number;
      height: string;
    }>
  );
});

test('infer return type via "from" and forward props', () => {
  const props = useSpring({
    from: { width: 0 },
    height: '100%',
  });
  assert(
    props,
    _ as SpringValues<{
      width: number;
      height: string;
    }>
  );
});

test('infer animated array', () => {
  const props = useSpring({
    to: { foo: [0, 0] },
  });
  assert(props.foo, _ as SpringValue<number[]>);
  assert(
    props,
    _ as SpringValues<{
      foo: number[];
    }>
  );

  test('interpolated array', () => {
    props.foo.interpolate((a, b) => {
      assert(a, _ as number);
      assert(b, _ as number);
      return 0;
    });
  });
});

test('imperative mode (inferred)', () => {
  const [props, ref] = useSpring(() => ({
    width: 0,
    onRest(event) {
      // FIXME: should include {foo: number}
      assert(event, _ as AnimationResult);
    },
  }));

  assert(props, _ as SpringValues<State>);
  assert(ref, _ as SpringRef<State>);
});

test('imperative mode', () => {
  const [props, ref] = useSpring<State>(() => ({
    width: 0,
    onRest(event) {
      // FIXME: should include {foo: number}
      assert(event, _ as AnimationResult);
    },
  }));

  assert(props, _ as SpringValues<State>);
  assert(ref, _ as SpringRef<State>);

  test('with delay and reset', () => {
    const [props] = useSpring(() => ({
      foo: 0,
      delay: 1000,
      reset: true,
    }));
    assert(
      props,
      _ as SpringValues<{
        foo: number;
      }>
    );
  });

  test('with callbacks', () => {
    const [props] = useSpring(() => ({
      foo: 0,
      onStart(...args) {
        assert(args, _ as []);
      },
      onChange(values) {
        assert(
          values,
          _ as any // FIXME: should be {foo: number}
        );
      },
      onRest(result) {
        // FIXME: should include {foo: number}
        assert(result, _ as AnimationResult);
      },
    }));
    assert(
      props,
      _ as SpringValues<{
        foo: number;
      }>
    );
  });
});

test('spring refs', () => {
  const ref = SpringRef();
  useSpring({ foo: 1, ref });
  ref.start();
  ref.stop(['foo', 'bar']);
  ref.stop();
});

test('basic config', () => {
  const props = useSpring({
    from: { width: 0 },
    reset: true,
    delay: 1000,
    onStart(...args) {
      assert(args, _ as []);
    },
    onChange(values) {
      assert(
        values,
        _ as any // FIXME: should be {width: number}
      );
    },
    onRest(result) {
      // FIXME: should include {width: number}
      assert(result, _ as AnimationResult);
    },
  });
  assert(
    props,
    _ as SpringValues<{
      width: number;
    }>
  );
});

test('function as "to" prop', () => {
  type State = { width: number };

  const props = useSpring({
    from: { width: 0 },
    to: async (next) => {
      assert(next, _ as SpringUpdateFn<State>);
      await next({
        width: 100,
        delay: 1000,
        config: { duration: 1000 },
        onRest(result) {
          assert(result, _ as AnimationResult<State>);
        },
      });
    },
  });

  assert(props, _ as SpringValues<State>);
});

test('array as "to" prop', () => {
  const props = useSpring({
    from: { width: 0 },
    to: [{ width: 100 }, { width: 0 }],
  });
  assert(props, _ as SpringValues<State>);
});

test('with "onProps" prop', () => {
  useSpring({
    width: 0,
    onProps(props, spring) {
      assert(props, _ as Readonly<RunAsyncProps<unknown>>);
      assert(spring, _ as SpringValue<unknown>);
    },
  });
});
