import { assert, test, _ } from 'spec.ts';
import { useSprings, SpringStopFn } from '../..';
import { Controller, ControllerProps } from 'core';
import {
  SpringsUpdateFn,
  SpringValues,
} from '@react-spring/core/src/types/spring';

const items: string[] = [];

test('pass an array', () => {
  const springs = useSprings(
    items.length,
    items.map(item => {
      assert(item, _ as string);
      return { opacity: 1 / Number(item) };
    })
  );
  assert(springs, _ as Array<
    SpringValues<{
      opacity: number;
    }>
  >);
});

test('pass a function', () => {
  const [springs, set, stop] = useSprings(2, i => {
    assert(i, _ as number);
    return { opacity: i };
  });
  type State = { opacity: number };
  assert(springs, _ as Array<
    SpringValues<{
      opacity: number;
    }>
  >);
  set({ opacity: 1 });
  set([{ opacity: 1 }, { opacity: 0.5 }]);
  set((_index: number, _spring: Controller<{ opacity: number }>) => {
    return _ as ControllerProps<{ opacity?: number }>;
  });
  assert(set, _ as SpringsUpdateFn<State>);
  assert(stop, _ as SpringStopFn<State>);
});
