export {}

declare global {
  export interface Window {
    env: {
      // Plausible
      ENABLE_PLAUSIBLE: string
    }
  }
}
