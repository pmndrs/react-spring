import { assert, _, test, describe } from 'spec.ts';
import { AnimatedProps, SpringValue } from '..';
import { AnimatedTransform } from 'src/animated';
import { ViewStyle } from 'react-native';

describe('AnimatedProps', () => {
  test('width prop', () => {
    type Props = AnimatedProps<{
      style?: { width?: number | string };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: {
          width?: number | string | SpringValue<number | string>;
        };
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
        foo: number | SpringValue<number>;
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
        bar?: number | { foo: number } | SpringValue<number>;
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
          | SpringValue<Array<number | string>>
          | Array<number | string | SpringValue<number | string>>;
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
          | SpringValue<number | number[]>
          | Array<number | SpringValue<number>>;
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
          | SpringValue<number[] | string[]>
          | Array<number | SpringValue<number>>
          | Array<string | SpringValue<string>>;
      }
    );
  });

  test('nested style array prop', () => {
    type Props = AnimatedProps<{
      style: [{ width: number }, [{ height: number }], false];
    }>;
    assert(
      _ as Props,
      _ as {
        style: [
          { width: number | SpringValue<number> },
          [{ height: number | SpringValue<number> }],
          false
        ];
      }
    );
  });

  test('with any', () => {
    type Props = AnimatedProps<any>;
    assert(_ as Props, _ as { [key: string]: any });
  });
});
