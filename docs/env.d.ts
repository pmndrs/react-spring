export {}

declare global {
  export interface Window {
    env: {
      // Plausible
      ENABLE_PLAUSIBLE: string
      // Algolia
      ALGOLIA_APP_ID: string
      ALGOLIA_API_KEY: string
    }
  }
}
