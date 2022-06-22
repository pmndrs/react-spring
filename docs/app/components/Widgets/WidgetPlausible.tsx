export const WidgetPlausible = () => {
  if (typeof window !== 'undefined' && !window.env.ENABLE_PLAUSIBLE) {
    return null
  }

  return (
    <script
      defer
      data-domain="react-spring.io"
      src="https://plausible.io/js/plausible.js"
    />
  )
}
