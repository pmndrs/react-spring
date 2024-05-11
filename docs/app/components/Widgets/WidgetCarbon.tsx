import { useEffect } from 'react'
import { useLocation } from '@remix-run/react'

export const WidgetCarbon = () => {
  const location = useLocation()

  useEffect(() => {
    const element = document.getElementById('carbonads')

    if (typeof window._carbonads !== 'undefined' && element) {
      window._carbonads.remove(element)
      window._carbonads.refresh()
    }
  }, [location.pathname])

  if (typeof window !== 'undefined' && window.env.ENABLE_CARBON !== 'true') {
    return null
  }

  return (
    <script
      async
      type="text/javascript"
      src="https://cdn.carbonads.com/carbon.js?serve=CEAIPK7I&placement=react-springdev"
      id="_carbonads_js"
    />
  )
}
