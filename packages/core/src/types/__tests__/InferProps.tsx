import { ForwardProps, NoInfer } from '../common';
import { Remap, Merge } from '@react-spring/shared';
import { assert, _ } from 'spec.ts';

type PickAnimated<Props extends object> = Remap<
  ForwardProps<Props> &
    (Props extends { from: infer From } ? From & object : {})
>;

type InferProps<Props extends object, From extends object> = Merge<
  Props,
  Partial<From> & {
    from: From;
  } & NoInfer<{
      onFrame?: (values: PickAnimated<Props>) => void;
    }>
>;

/**
 * The `Merge` type does a few things here:
 *   - It ensures type errors specify the expected type (instead of "never")
 *   - It ensures the `From` param is respected by "forward props"
 */
declare const useSpring: <Props extends object, From extends object>(
  props: InferProps<Props, From>
) => PickAnimated<Props>; // Remap<From & ForwardProps<Props>>;

// "a" can be anything when "from.a" is undefined
const values = useSpring({
  a: 0,
  from: { b: 0 },
});
assert(values, _ as { a: number; b: number });

// "a" must be assignable to "from.a" when both are defined
useSpring({
  a: '0deg',
  from: { a: 0 },
});

// "from" must be an object when defined
useSpring({
  from: true,
});

// "onFrame" correctly infers its argument type
useSpring({
  a: 0,
  from: { b: 0 },
  onFrame(values) {
    assert(values, _ as { a: number; b: number });
  },
});
