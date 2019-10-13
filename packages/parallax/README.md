# @react-spring/parallax

This package exports the `Parallax` and `ParallaxLayer` components. Both are wrapped with `React.memo`.

`Parallax` creates a scroll container. Throw in any amount of `ParallaxLayer`s and it will take care of
moving them in accordance to their offsets and speeds.

**Note:** Currently, only `@react-spring/web` is supported.

```tsx
import { Parallax, ParallaxLayer } from '@react-spring/parallax'

const Example = () => {
  const ref = useRef<Parallax>()
  return (
    <Parallax ref={ref} pages={3} scrolling={false} horizontal>
      <ParallaxLayer offset={0} speed={0.5}>
        <span
          onClick={() => {
            ref.current.scrollTo(1)
          }}>
          Layers can contain anything
        </span>
      </ParallaxLayer>
    </Parallax>
  )
}
```

## `Parallax` props

- `pages: number`

  Determines the total space of the inner content where each page takes 100% of the visible container.

- `config?: SpringConfig`

  The spring behavior.

  Defaults to `config.slow`.

- `scrolling?: boolean`

  Allow content to be scrolled or not.

  Defaults to `true`.

- `horizontal?: boolean

  When `true`, content scrolls from left to right.

  Defaults to `false`.

## `ParallaxLayer` props

- `factor?: number`

  The page size (eg: 1 => 100%, 1.5 => 150%, etc)

  Defaults to `1`.

- `offset?: number`

  The page offset (eg: 0 => top of 1st page, 1 => top of 2nd page, etc)

  Defaults to `0`.

- `speed?: number`

  Shift the layer in accordance to its offset. Values can be positive or negative.

  Defaults to `0`.

## Credits

Paul Henschel
