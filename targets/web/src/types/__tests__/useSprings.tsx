import { assert, test, _ } from 'spec.ts';
import { useSprings, SpringStopFn } from '../..';
import {
  Controller,
  ControllerProps,
  SpringStartFn,
  SpringValues,
} from '@react-spring/core';

const items: string[] = [];

type State = { opacity: number };

test('pass an array', () => {
  const springs = useSprings(
    items.length,
    items.map((item) => {
      assert(item, _ as string);
      return { opacity: 1 / Number(item) };
    })
  );
  assert(springs, _ as Array<SpringValues<State>>);
});

test('pass a function', () => {
  const [springs, set, stop] = useSprings(2, (i) => {
    assert(i, _ as number);
    return { opacity: i };
  });

  assert(springs, _ as Array<SpringValues<State>>);

  set({ opacity: 1 });
  set([{ opacity: 1 }, { opacity: 0.5 }]);
  set((_index: number, _spring: Controller<State>) => {
    return _ as ControllerProps<State>;
  });

  assert(set, _ as SpringStartFn<State>);
  assert(stop, _ as SpringStopFn<State>);
});
