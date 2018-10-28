import Animated from './Animated'

const getValues = object => Object.keys(object).map(k => object[k])

export default class AnimatedWithChildren extends Animated {
  children = []

  addChild(child) {
    if (this.children.length === 0) this.attach()
    this.children.push(child)
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    if (index === -1) {
      if (process.env.NODEENV !== 'production') {
        console.warn("Trying to remove a child that doesn't exist")
      }
      return
    }
    this.children.splice(index, 1)
    if (this.children.length === 0) this.detach()
  }

  getChildren = () => this.children

  // This function returns the animated value the object holds, even if it points to itself,
  // while an object like AnimatedArray will points to its children
  getPayload = (index = undefined) =>
    index !== void 0 && this.payload
      ? this.payload[index]
      : this.payload || this
}

export class AnimatedArrayWithChildren extends AnimatedWithChildren {
  payload = []
  getAnimatedValue = () => this.getValue()
  attach = () =>
    this.payload.forEach(p => p instanceof Animated && p.addChild(this))
  detach = () =>
    this.payload.forEach(p => p instanceof Animated && p.removeChild(this))
}

export class AnimatedObjectWithChildren extends AnimatedWithChildren {
  payload = {}
  getValue(animated = false) {
    const payload = {}
    for (const key in this.payload) {
      const value = this.payload[key]
      if (animated && !(value instanceof Animated)) continue
      payload[key] =
        value instanceof Animated
          ? value[animated ? 'getAnimatedValue' : 'getValue']()
          : value
    }
    return payload
  }
  getAnimatedValue = () => this.getValue(true)
  attach = () =>
    getValues(this.payload).forEach(
      s => s instanceof Animated && s.addChild(this)
    )
  detach = () =>
    getValues(this.payload).forEach(
      s => s instanceof Animated && s.removeChild(this)
    )
}
