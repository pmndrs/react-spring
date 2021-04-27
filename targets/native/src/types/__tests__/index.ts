import { assert, _, test, describe } from 'spec.ts';
import { AnimatedProps, AnimatedTransform } from '../../animated';
import { FluidProps, FluidValue } from '@react-spring/shared';
import { ViewStyle } from 'react-native';

describe('AnimatedProps', () => {
  test('width prop', () => {
    type Props = AnimatedProps<{
      style?: { width?: number | string };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: FluidProps<{
          width?: number | string;
        }>;
      }
    );
  });

  test('ref prop', () => {
    type Props = AnimatedProps<{
      ref: { current: any };
      foo: number;
    }>;
    assert(
      _ as Props,
      _ as {
        ref: { current: any };
        foo: number | FluidValue<number>;
      }
    );
  });

  test('transform prop', () => {
    type Props = AnimatedProps<{
      style?: {
        transform: ViewStyle['transform'];
      };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: {
          transform: AnimatedTransform;
        };
      }
    );
  });

  test('non-style object prop', () => {
    type Props = AnimatedProps<{
      foo: { bar: number };
      bar?: number | { foo: number };
    }>;
    assert(
      _ as Props,
      _ as {
        foo: { bar: number };
        bar?: number | { foo: number } | FluidValue<number>;
      }
    );
  });

  test('array of mixed numbers/strings', () => {
    type Props = AnimatedProps<{
      path: Array<number | string>;
    }>;
    assert(
      _ as Props,
      _ as {
        path:
          | FluidValue<Array<number | string>>
          | Array<number | string | FluidValue<number | string>>;
      }
    );
  });

  test('one number or array of numbers', () => {
    type Props = AnimatedProps<{
      path: number | number[];
    }>;
    assert(
      _ as Props,
      _ as {
        path:
          | number
          | FluidValue<number | number[]>
          | Array<number | FluidValue<number>>;
      }
    );
  });

  test('array of numbers or array of strings', () => {
    type Props = AnimatedProps<{
      path: number[] | string[];
    }>;
    assert(
      _ as Props,
      _ as {
        path:
          | FluidValue<number[] | string[]>
          | Array<number | FluidValue<number>>
          | Array<string | FluidValue<string>>;
      }
    );
  });

  // FIXME: not yet supported
  // test('nested style array prop', () => {
  //   type Props = AnimatedProps<{
  //     style: StyleProp<{ width?: number }>;
  //   }>;
  //   assert(_ as Props, _ as {});
  // });

  test('with any', () => {
    type Props = AnimatedProps<any>;
    assert(_ as Props, _ as { [key: string]: any });
  });
});
