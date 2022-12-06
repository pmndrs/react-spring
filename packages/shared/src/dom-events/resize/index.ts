import { resizeElement } from './resizeElement'
import { resizeWindow } from './resizeWindow'

export interface OnResizeOptions {
  container?: HTMLElement
}

export type OnResizeCallback = (
  rect: Pick<DOMRectReadOnly, 'width' | 'height'> &
    Partial<Omit<DOMRectReadOnly, 'width' | 'height'>>
) => void

export const onResize = (
  callback: OnResizeCallback,
  { container = document.documentElement }: OnResizeOptions = {}
): (() => void) => {
  if (container === document.documentElement) {
    return resizeWindow(callback)
  } else {
    return resizeElement(callback, container)
  }
}
