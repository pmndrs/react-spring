# @react-spring/parallax

```bash
yarn add @react-spring/parallax
```

**NOTE**: Currently, only `@react-spring/web` is supported.

`Parallax` creates a scrollable container. `ParallaxLayer`s contain your content and will be moved according to their offsets and speeds.

```jsx
import { Parallax, ParallaxLayer } from '@react-spring/parallax'

const Example = () => {
  const ref = useRef()
  return (
    <Parallax pages={3} ref={ref}>
      <ParallaxLayer offset={0} speed={2.5}>
        <p>Layers can contain anything</p>
      </ParallaxLayer>

      <ParallaxLayer offset={1} speed={-2} factor={1.5} horizontal />

      <ParallaxLayer sticky={{ start: 1, end: 2 }} />

      <ParallaxLayer offset={2} speed={1}>
        <button onClick={() => ref.current.scrollTo(0)}>Scroll to top</button>
      </ParallaxLayer>
    </Parallax>
  )
}
```

## Parallax

| Property    | Type          | Description                                                                                             |
| ----------- | ------------- | ------------------------------------------------------------------------------------------------------- |
| pages       | number        | Total space of the container. Each page takes up 100% of the viewport.                                  |
| config?     | SpringConfig  | The spring behavior. Defaults to `config.slow` (see [configs](https://react-spring.io/common/configs)). |
| enabled?    | boolean       | Whether or not the content can be scrolled. Defaults to `true`.                                         |
| horizontal? | boolean       | Whether or not the container scrolls horizontally. Defaults to `false`.                                 |
| innerStyle? | CSSProperties | CSS object to style the inner `Parallax` wrapper (not the scrollable container)                         |

### `ref` Properties

`Parallax` also has a few useful properties that you can access using a `ref`:

```jsx
const ref = useRef()
...
<Parallax ref={ref}>
```

#### `ref.current.scrollTo`

A function for click-to-scroll. It takes one paramater: the number of the page to scroll to. Pages are zero-indexed, so `scrollTo(0)` will scroll to the first page, `scrollTo(1)` to the second, etc.

#### `ref.current.container`

The `ref` for the outer container `div` of `Parallax`, for when you need access to the actual DOM Element.

**NOTE**: since it is also a `ref`, it must be accessed with `ref.current.container.current`.

#### `ref.current.content`

The `ref` for the inner container `div` of `Parallax`.

### Usage Notes

- All direct `children` of `Parallax` must be `ParallaxLayer`s (or `fragment`s whose only direct `children` are `ParallaxLayer`s).
- `Parallax` is a scrollable container so all scroll events are fired from the container itself -- listening for scroll on `window` won't work (but you _can_ use `ref.current.container`).

## ParallaxLayer

| Property    | Type         | Description                                                                                                                                        |
| ----------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| factor?     | number       | Size of the layer relative to page size (eg: `1` => 100%, `1.5` => 150%, etc). Defaults to `1`.                                                    |
| offset?     | number       | The offset of the layer when it's corresponding page is fully in view (eg: `0` => top of 1st page, `1` => top of 2nd page, etc ). Defaults to `0`. |
| speed?      | number       | Rate at which the layer moves in relation to scroll. Can be positive or negative. Defaults to `0`.                                                 |
| horizontal? | boolean      | Whether or not the layer moves horizontally. Defaults to the `horizontal` value of `Parallax` (whose default is `false`).                          |
| sticky?     | StickyConfig | If set, the layer will be 'sticky' between the two offsets. All other props are ignored. Default: `{start?: number = 0, end?: number = start + 1}` |

### Usage Notes

- The `offset` prop is where the layer will end up, not where it begins. For example, if a layer has an offset of `1.5`, it will be halfway down the second page (zero-indexed) when the second page completely fills the viewport.
- The `speed` prop will affect the initial starting position of a layer, but not it's final `offset` position.
- Any layer with `sticky` set will have a `z-index` higher than regular layers. This can be changed manually.

## Demos

- [Parallax - vertical](https://codesandbox.io/s/github/pmndrs/react-spring/tree/main/demo/src/sandboxes/parallax-vert)
- [Parallax - horizontal](https://codesandbox.io/s/github/pmndrs/react-spring/tree/main/demo/src/sandboxes/parallax)
- [Parallax - sticky](https://codesandbox.io/s/github/pmndrs/react-spring/tree/main/demo/src/sandboxes/parallax-sticky)
