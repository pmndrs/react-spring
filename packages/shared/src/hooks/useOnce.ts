/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, EffectCallback } from 'react'

export const useOnce = (effect: EffectCallback) => useEffect(effect, emptyDeps)

const emptyDeps: any[] = []
