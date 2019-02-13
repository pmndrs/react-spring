import Animated from './Animated'

type AnimatedObjectPayload = { [key: string]: Animated }

export default abstract class AnimatedWithChildren extends Animated {
  children: Animated[] = []
  payload?: Animated[] | AnimatedObjectPayload

  addChild(child: Animated) {
    if (this.children.length === 0) this.attach()
    this.children.push(child)
  }

  removeChild(child: Animated) {
    const index = this.children.indexOf(child)
    this.children.splice(index, 1)
    if (this.children.length === 0) this.detach()
  }

  getChildren = () => this.children

  // This function returns the animated value the object holds, even if it points to itself,
  // while an object like AnimatedArray will points to its children
  getPayload = () => this.payload || this
}

export abstract class AnimatedArrayWithChildren extends AnimatedWithChildren {
  payload: Animated[] = []

  attach = () =>
    this.payload.forEach(p => p instanceof Animated && p.addChild(this))

  detach = () =>
    this.payload.forEach(p => p instanceof Animated && p.removeChild(this))
}

export abstract class AnimatedObjectWithChildren extends AnimatedWithChildren {
  payload: AnimatedObjectPayload = {}

  getValue(animated = false) {
    const payload: AnimatedObjectPayload = {}
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
    Object.values(this.payload).forEach(
      s => s instanceof Animated && s.addChild(this)
    )

  detach = () =>
    Object.values(this.payload).forEach(
      s => s instanceof Animated && s.removeChild(this)
    )
}
