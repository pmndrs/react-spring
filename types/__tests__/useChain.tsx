import { test } from 'spec.ts';
import { useChain, SpringHandle } from '../web';
import { RefObject } from 'react';

const refs: RefObject<SpringHandle>[] = [];

test('basic usage', () => {
  // No timesteps
  useChain(refs);

  // With timesteps
  useChain(refs, [0, 1]);

  // Cut timesteps in half
  useChain(refs, [0, 1], 1000 / 2);
});
