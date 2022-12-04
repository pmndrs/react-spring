import type { OnResizeCallback } from '.'

const listeners = new Set<OnResizeCallback>()

let cleanupWindowResizeHandler: VoidFunction | undefined

const createResizeHandler = () => {
  const handleResize = () => {
    listeners.forEach(callback =>
      callback({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    )
  }

  window.addEventListener('resize', handleResize)

  return () => {
    window.removeEventListener('resize', handleResize)
  }
}

export const resizeWindow = (callback: OnResizeCallback) => {
  listeners.add(callback)

  if (!cleanupWindowResizeHandler) {
    cleanupWindowResizeHandler = createResizeHandler()
  }

  return () => {
    listeners.delete(callback)

    if (!listeners.size && cleanupWindowResizeHandler) {
      cleanupWindowResizeHandler()
      cleanupWindowResizeHandler = undefined
    }
  }
}
