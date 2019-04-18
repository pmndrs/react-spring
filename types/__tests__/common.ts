import {
  PickAnimated,
  ForwardProps,
  AnimatedProps,
  AnimatedValue,
  AnimationFrame,
  UnknownProps,
  Remap,
} from '../lib/common';
import { assert, _, test } from 'spec.ts';

const $1: 1 = 1;

const reservedProps = {
  config: $1,
  from: {},
  to: {},
  ref: $1,
  cancel: $1,
  reset: $1,
  reverse: $1,
  immediate: $1,
  delay: $1,
  lazy: $1,
  onStart: $1,
  onRest: $1,
  onFrame: $1,
};

const forwardProps = {
  foo: $1,
  bar: $1,
};

type R = typeof reservedProps;
type F = typeof forwardProps;

test('ForwardProps', () => {
  // With reserved props, no forward props
  type P1 = ForwardProps<R>;
  assert(_ as P1, _ as {});

  // With reserved and forward props
  type P2 = ForwardProps<R & F>;
  assert(_ as P2, _ as F);

  // With forward props, no reserved props
  type P3 = ForwardProps<F>;
  assert(_ as P3, _ as F);

  // No reserved or forward props
  type P4 = ForwardProps<{}>;
  assert(_ as P4, _ as {});
});

test('PickAnimated', () => {
  // No props
  type A1 = PickAnimated<{}>;
  assert(_ as A1, _ as {});

  // Forward props only
  type A3 = PickAnimated<F>;
  assert(_ as A3, _ as F);

  // Forward props and "from" prop
  type A4 = PickAnimated<{
    foo: 1;
    width: 1;
    from: { bar: 1; width: 2 };
  }>;
  assert(_ as A4, _ as Remap<F & { width: 1 | 2 }>);

  // "to" and "from" props
  type A5 = PickAnimated<{
    to: { foo: 1; width: 1 };
    from: { bar: 1; width: 2 };
  }>;
  assert(_ as A5, _ as Remap<F & { width: 1 | 2 }>);

  // "useTransition" props
  type A6 = PickAnimated<{
    from: { a: 1 };
    initial: { b: 1 };
    enter: { c: 1 };
    update: { d: 1 };
    leave: { e: 1 };
  }>;
  assert(
    _ as A6,
    _ as {
      a: 1;
      b: 1;
      c: 1;
      d: 1;
      e: 1;
    }
  );

  // Same keys in each phase
  type A7 = PickAnimated<{
    from: { a: 1 };
    enter: { a: 2 };
    leave: { a: 3 };
    update: { a: 4 };
    initial: { a: 5 };
  }>;
  assert(
    _ as A7,
    _ as {
      a: 1 | 2 | 3 | 4 | 5;
    }
  );
});

test('AnimatedProps', () => {
  // Primitive props
  type P2 = AnimatedProps<{ foo?: number }>;
  assert(
    _ as P2,
    _ as {
      foo?: number | AnimatedValue<number>;
    }
  );

  // Object props
  type P3 = AnimatedProps<{ foo?: { bar?: number } }>;
  assert(
    _ as P3,
    _ as {
      foo?: AnimatedProps<{ bar?: number }>;
    }
  );

  // Array props
  type P4 = AnimatedProps<{ foo: [number, number] }>;
  assert(
    _ as P4,
    _ as {
      foo: [number, number] | AnimatedValue<[number, number]>;
    }
  );

  // Atomic object props
  type P5 = AnimatedProps<{
    set: Set<any>;
    map: Map<any, any>;
    date: Date;
    func: Function;
    prom: Promise<any>;
  }>;
  assert(
    _ as P5,
    _ as {
      set: Set<any> | AnimatedValue<Set<any>>;
      map: Map<any, any> | AnimatedValue<Map<any, any>>;
      date: Date | AnimatedValue<Date>;
      func: Function | AnimatedValue<Function>;
      prom: Promise<any> | AnimatedValue<Promise<any>>;
    }
  );
});

test('SpringFrame', () => {
  type T1 = AnimationFrame<{}>;
  assert(_ as T1, _ as UnknownProps);

  type T2 = AnimationFrame<{ to: { a: number }; from: { b: number } }>;
  assert(_ as T2, _ as { [key: string]: unknown; a: number; b: number });
});
