import { useRef, useState, useEffect } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

export function useMeasure() {
  const ref = useRef()
  const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [ro] = useState(
    () => new ResizeObserver(([entry]) => set(entry.contentRect))
  )
  useEffect(() => (ro.observe(ref.current), ro.disconnect), [])
  return [{ ref }, bounds]
}

export function useMedia(queries, values, defaultValue) {
  const match = () =>
    values[queries.findIndex(q => matchMedia(q).matches)] || defaultValue
  const [value, set] = useState(match)
  useEffect(() => {
    const handler = () => set(match)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener(handler)
  }, [])
  return value
}
