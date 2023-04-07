import { useCallback, useEffect, useState } from 'react'

export default function useMedia(queries: string[], values: number[], defaultValue: number) {
  const match = useCallback(
    () => values[queries.findIndex(q => matchMedia(q).matches)] || defaultValue,
    [defaultValue, queries, values]
  )
  const [value, set] = useState(match)
  useEffect(() => {
    const handler = () => set(match)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [match])
  return value
}
