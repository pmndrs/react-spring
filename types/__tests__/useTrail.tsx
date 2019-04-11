import { assert, _ } from 'spec.ts';
import { useTrail } from '../web';
import { AnimatedValue } from '../lib/common';
import { SpringUpdateFn, SpringStopFn } from '../lib/useSpring';

test('basic usage', () => {
  const springs = useTrail(3, { opacity: 1 });
  assert(springs, _ as Array<{
    [key: string]: AnimatedValue<any>;
    opacity: AnimatedValue<number>;
  }>);
});

test('function argument', () => {
  const [springs, set, stop] = useTrail(3, () => ({ opacity: 1 }));
  assert(springs, _ as Array<{
    [key: string]: AnimatedValue<any>;
    opacity: AnimatedValue<number>;
  }>);
  assert(set, _ as SpringUpdateFn<{
    opacity: number;
  }>);
  assert(stop, _ as SpringStopFn);
});
