import { assert, test, _ } from 'spec.ts';
import { useSprings, SpringValue, SpringUpdateFn, SpringStopFn } from '..';

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
  assert(set, _ as SpringUpdateFn<{
    opacity: number;
  }>);
  assert(stop, _ as SpringStopFn);
});
