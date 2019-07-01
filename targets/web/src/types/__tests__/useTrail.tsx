import { assert, test, _ } from 'spec.ts';
import { useTrail, SpringValue, SpringUpdateFn, SpringStopFn } from '../..';

test('basic usage', () => {
  const springs = useTrail(3, { opacity: 1 });
  assert(springs, _ as Array<{
    [key: string]: SpringValue<any>;
    opacity: SpringValue<number>;
  }>);
});

test('function argument', () => {
  const [springs, set, stop] = useTrail(3, () => ({ opacity: 1 }));
  assert(springs, _ as Array<{
    [key: string]: SpringValue<any>;
    opacity: SpringValue<number>;
  }>);
  assert(set, _ as SpringUpdateFn<{
    opacity: number;
  }>);
  assert(stop, _ as SpringStopFn);
});
