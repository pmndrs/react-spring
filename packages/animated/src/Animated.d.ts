export declare function isAnimated(val: unknown): val is Animated
export declare abstract class Animated<Payload = unknown> {
  abstract getValue(): any
  getAnimatedValue(): any
  protected payload?: Payload
  getPayload(): Payload | this
  attach(): void
  detach(): void
  private children
  getChildren(): Animated<unknown>[]
  addChild(child: Animated): void
  removeChild(child: Animated): void
}
export declare abstract class AnimatedArray<
  Payload extends ReadonlyArray<any> = ReadonlyArray<unknown>
> extends Animated<Payload> {
  protected payload: Payload
  attach(): void
  detach(): void
}
export declare class AnimatedObject<
  Payload extends {
    [key: string]: unknown
  }
> extends Animated<Payload> {
  protected payload: Payload
  constructor(payload: Payload)
  getValue(
    animated?: boolean
  ): {
    [key: string]: any
  }
  getAnimatedValue(): {
    [key: string]: any
  }
  attach(): void
  detach(): void
}
