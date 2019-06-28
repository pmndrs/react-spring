import { assert, test, _ } from 'spec.ts';
import { useSprings, SpringValue, SpringUpdateFn, SpringStopFn } from '..';
import { Controller, SpringUpdate } from '@react-spring/core';

const items: string[] = [];

test('pass an array', () => {
  const springs = useSprings(
    items.length,
    items.map(item => {
      assert(item, _ as string);
      return { opacity: 1 / Number(item) };
    })
  );
  assert(springs, _ as Array<{
    [key: string]: SpringValue<any>;
    opacity: SpringValue<number>;
  }>);
});

test('pass a function', () => {
  const [springs, set, stop] = useSprings(2, i => {
    assert(i, _ as number);
    return { opacity: i };
  });
  assert(springs, _ as Array<{
    [key: string]: SpringValue<any>;
    opacity: SpringValue<number>;
  }>);
  set({ opacity: 1 });
  set([{ opacity: 1 }, { opacity: 0.5 }]);
  set((_index: number, _spring: Controller<{ opacity: number }>) => {
    return _ as SpringUpdate<{ opacity?: number }>;
  });
  assert(set, _ as SpringUpdateFn<{
    opacity: number;
  }>);
  assert(stop, _ as SpringStopFn);
});
