export {}

declare global {
  interface Window {
    plausible?: (...args: unknown[]) => void
    _carbonads: {
      refresh: () => void
      remove: (element: HTMLElement) => void
    }
  }
}
