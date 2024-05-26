import { useEffect, useRef } from 'react'
import { useLocation } from '@remix-run/react'

export const WidgetCarbon = () => {
  const location = useLocation()
  const ref = useRef<HTMLDivElement>(null!)
  const hasInserted = useRef(false)

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.env.ENABLE_CARBON === 'true' &&
      !hasInserted.current
    ) {
      hasInserted.current = true
      ref.current.innerHTML = ''
      const s = document.createElement('script')
      s.defer = true
      s.async = true
      s.id = '_carbonads_js'
      s.type = 'text/javascript'
      s.src = `//cdn.carbonads.com/carbon.js?serve=CEAIPK7I&placement=react-springdev`

      ref.current.appendChild(s)
    }
  }, [hasInserted])

  useEffect(() => {
    const element = document.getElementById('carbonads')

    if (typeof window._carbonads !== 'undefined' && element) {
      window._carbonads.remove(element)
      window._carbonads.refresh()
    }
  }, [location.pathname])

  return <div className="flex justify-center my-2" ref={ref} />
}
