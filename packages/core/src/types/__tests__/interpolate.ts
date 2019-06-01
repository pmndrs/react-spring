import { test, assert, _ } from 'spec.ts';
import { interpolate, SpringValue } from '../..';

/** Return the arguments as-is */
const args = <T extends ReadonlyArray<any>>(...args: T) => args;

test('with one SpringValue', () => {
  // Basic value
  const out1 = interpolate(_ as SpringValue<number>, args);
  assert(out1, _ as SpringValue<[number]>);

  // Array value
  const out2 = interpolate(_ as SpringValue<[number, number]>, args);
  assert(out2, _ as SpringValue<[number, number]>);
});

test('with an array of SpringValues', () => {
  // 1 value
  const out1 = interpolate(_ as [SpringValue<number>], args);
  assert(out1, _ as SpringValue<[number]>);

  // 2 values
  const out2 = interpolate(
    _ as [SpringValue<number>, SpringValue<string>],
    args
  );
  assert(out2, _ as SpringValue<[number, string]>);

  // Infinite values
  const out3 = interpolate(_ as SpringValue<number>[], args);
  assert(out3, _ as SpringValue<number[]>);
});
