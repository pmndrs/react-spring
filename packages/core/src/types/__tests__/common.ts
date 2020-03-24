import { assert, _, test } from 'spec.ts';
import { Remap } from '../common';
import { SpringUpdateFn } from '../functions';
import { PickAnimated, ForwardProps, ReservedProps } from '../props';

type SystemProps = {
  [P in keyof ReservedProps]-?: P extends 'from' | 'to' ? {} : 1;
};

type UserProps = {
  foo: 1;
  bar: 1;
};

test('ForwardProps', () => {
  // With reserved props, no forward props
  type P1 = ForwardProps<SystemProps>;
  assert(_ as P1, _ as {});

  // With reserved and forward props
  type P2 = ForwardProps<SystemProps & UserProps>;
  assert(_ as P2, _ as UserProps);

  // With forward props, no reserved props
  type P3 = ForwardProps<UserProps>;
  assert(_ as P3, _ as UserProps);

  // No reserved or forward props
  type P4 = ForwardProps<{}>;
  assert(_ as P4, _ as {});
});

test('PickAnimated', () => {
  // No props
  type A1 = PickAnimated<{}>;
  assert(_ as A1, _ as {});

  // Forward props only
  type A3 = PickAnimated<UserProps>;
  assert(_ as A3, _ as UserProps);

  // Forward props and "from" prop
  type A4 = PickAnimated<{
    foo: 1;
    width: 1;
    from: { bar: 1; width: 2 };
  }>;
  assert(_ as A4, _ as Remap<UserProps & { width: 1 | 2 }>);

  // "to" and "from" props
  type A5 = PickAnimated<{
    to: { foo: 1; width: 1 };
    from: { bar: 1; width: 2 };
  }>;
  assert(_ as A5, _ as Remap<UserProps & { width: 1 | 2 }>);

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

  // Async "to" chain
  type A8 = PickAnimated<{
    from: { a: 1 };
    to: [{ a: 2 }, { a: 3 }];
  }>;
  assert(
    _ as A8,
    _ as {
      a: 1;
    }
  );

  // Async "to" script
  type A9 = PickAnimated<{
    from: { a: 1 };
    to: (next: SpringUpdateFn<any>) => void;
  }>;
  assert(
    _ as A9,
    _ as {
      a: 1;
    }
  );
});
