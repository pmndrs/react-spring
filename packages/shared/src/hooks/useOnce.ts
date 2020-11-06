import { useEffect } from 'react'

// Explicit type annotation fixes TS2742 error.
type UseOnce = (effect: React.EffectCallback) => void

export const useOnce: UseOnce = effect => useEffect(effect, emptyDeps)

const emptyDeps: any[] = []
