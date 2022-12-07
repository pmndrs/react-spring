export {}

declare global {
  export interface Window {
    plausible?: (...args: unknown[]) => void
    _carbonads: {
      refresh: () => void
      remove: (element: HTMLElement) => void
    }

    env: {
      // Plausible
      ENABLE_PLAUSIBLE: string
      // Algolia
      ALGOLIA_APP_ID: string
      ALGOLIA_API_KEY: string
      // Carbon
      ENABLE_CARBON: string
    }
  }
}
