import { assert, _, test, describe } from 'spec.ts';
import { AnimatedProps, AnimatedValue } from '../web';
import { CSSProperties } from 'react';

describe('AnimatedProps', () => {
  test('width prop', () => {
    type Props = AnimatedProps<{
      style?: { width?: CSSProperties['width'] };
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

  test('string union prop', () => {
    type WordWrap = CSSProperties['wordWrap'];
    type Props = AnimatedProps<{
      style: { wordWrap: WordWrap };
    }>;
    assert(
      _ as Props,
      _ as {
        style: {
          wordWrap: WordWrap | AnimatedValue<Exclude<WordWrap, void>>;
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
        transform: string;
      };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: {
          transform: string | AnimatedValue<string>;
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
