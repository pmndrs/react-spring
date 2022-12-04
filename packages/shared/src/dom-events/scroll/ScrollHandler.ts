import { progress } from '../../progress'

import type { OnScrollCallback } from './index'

const SCROLL_KEYS = {
  x: {
    length: 'Width',
    position: 'Left',
  },
  y: {
    length: 'Height',
    position: 'Top',
  },
}

/**
 * Whilst user's may not need the scrollLength, it's easier to return
 * the whole state we're storing and let them pick what they want.
 */
export interface ScrollAxis {
  current: number
  progress: number
  scrollLength: number
}

export interface ScrollInfo {
  time: number
  x: ScrollAxis
  y: ScrollAxis
}

/**
 * Why use a class? More extensible in the future.
 */
export class ScrollHandler {
  protected callback: OnScrollCallback
  protected container: HTMLElement
  protected info: ScrollInfo

  constructor(callback: OnScrollCallback, container: HTMLElement) {
    this.callback = callback
    this.container = container

    this.info = {
      time: 0,
      x: this.createAxis(),
      y: this.createAxis(),
    }
  }

  private createAxis = (): ScrollAxis => ({
    current: 0,
    progress: 0,
    scrollLength: 0,
  })

  private updateAxis = (axisName: keyof Pick<ScrollInfo, 'x' | 'y'>) => {
    const axis = this.info[axisName]
    const { length, position } = SCROLL_KEYS[axisName]

    axis.current = this.container[`scroll${position}`]
    axis.scrollLength =
      this.container['scroll' + length] - this.container['client' + length]

    axis.progress = progress(0, axis.scrollLength, axis.current)
  }

  private update = () => {
    this.updateAxis('x')
    this.updateAxis('y')
  }

  private sendEvent = () => {
    this.callback(this.info)
  }

  advance = () => {
    this.update()
    this.sendEvent()
  }
}
