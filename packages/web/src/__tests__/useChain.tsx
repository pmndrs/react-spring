import { test } from 'spec.ts';
import { RefObject } from 'react';
import { SpringHandle } from '@react-spring/core';
import { useChain } from '..';

const refs: RefObject<SpringHandle>[] = [];

test('basic usage', () => {
  // No timesteps
  useChain(refs);

  // With timesteps
  useChain(refs, [0, 1]);

  // Cut timesteps in half
  useChain(refs, [0, 1], 1000 / 2);
});
