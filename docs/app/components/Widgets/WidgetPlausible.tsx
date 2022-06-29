export const WidgetPlausible = () => {
  if (typeof window !== 'undefined' && !window.env.ENABLE_PLAUSIBLE) {
    return null
  }

  return (
    <script
      defer
      data-domain="beta.react-spring.dev"
      src="https://plausible.io/js/plausible.js"
    />
  )
}
