import { assert, _, test, describe } from 'spec.ts';
import { AnimatedProps, AnimatedValue } from '../native';

describe('AnimatedProps', () => {
  test('width prop', () => {
    type Props = AnimatedProps<{
      style?: { width?: number | string };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: {
          width?: number | string | AnimatedValue<number | string>;
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
        foo: number | AnimatedValue<number>;
      }
    );
  });

  test('transform prop', () => {
    type Props = AnimatedProps<{
      style?: {
        transform: [{ rotateX: string }, { translateY: number }];
      };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: {
          transform: [
            { rotateX: string | AnimatedValue<string> },
            { translateY: number | AnimatedValue<number> }
          ];
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
        bar?: number | { foo: number } | AnimatedValue<number>;
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
          { width: number | AnimatedValue<number> },
          [{ height: number | AnimatedValue<number> }],
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
