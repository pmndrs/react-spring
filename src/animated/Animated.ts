export default abstract class Animated<T = any> {
  abstract addChild(child: Animated): void
  abstract removeChild(child: Animated): void
  abstract getValue(): T
  attach(): void {}
  detach(): void {}
  getAnimatedValue(): T {
    return this.getValue()
  }
  getChildren(): Animated[] {
    return []
  }
}
