export {}

declare global {
  interface Window {
    plausible?: (...args: unknown[]) => void
  }
}
