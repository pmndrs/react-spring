## 5.0.0

Breaking changes:

* Parallax doesn't rely on create-react-context any longer, depends on React 16.3.2 (only affects Parallax)
* config, immediate and hold accept functions or their individual values. immediate will not accept accept an array any longer, if you want to set a individual property immediately without animating it, do this: `immediate={name => name === 'x'}`. config and hold can do the same, meaning you can give properties different config settings for instance.
* Transition bugfix (#67)

## 4.2.0

* Exposed imperative Value animations: https://codesandbox.io/embed/3x350m0541
* Exposed createAnimatedValue: https://github.com/drcmda/react-spring/pull/63#issuecomment-382845475
* hold property: https://github.com/drcmda/react-spring/pull/48
* Various bugfixes

## 4.0.2

Keyframe api, various bugfixes

## 3.1.0

Breaking changes:

* Transition doesn't need `keys` any longer if it's a two-state transition/reveal.

```jsx
<Transition from={{ opacity: 0 }} enter={{ opacity: 1 }} leave={{ opacity: 0 }}>
  {toggle ? ComponentA : ComponentB}
</Transition>
```

## 3.0.0

Breaking changes:

* SpringTrail -> Trail
* SpringTransition -> Transition

New primitives:

* Parallax
