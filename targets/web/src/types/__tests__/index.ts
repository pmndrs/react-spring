import { assert, _, test, describe } from 'spec.ts';
import { FluidValue } from '@react-spring/shared';
import { CSSProperties } from 'react';

import { AnimatedProps } from '../..';

describe('AnimatedProps', () => {
  test('width prop', () => {
    type Props = AnimatedProps<{
      style?: { width?: CSSProperties['width'] };
    }>;
    assert(
      _ as Props,
      _ as {
        style?: {
          width?: number | string | FluidValue<number | string>;
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
          wordWrap: WordWrap | FluidValue<Exclude<WordWrap, void>>;
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
        foo: number | FluidValue<number>;
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
          transform: string | FluidValue<string>;
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

  test('nested style array prop', () => {
    type Props = AnimatedProps<{
      style: [{ width: number }, [{ height: number }], false];
    }>;
    assert(
      _ as Props,
      _ as {
        style: [
          { width: number | FluidValue<number> },
          [{ height: number | FluidValue<number> }],
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
