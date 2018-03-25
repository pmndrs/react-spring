## 3.1.0

Breaking changes:

* Transition doesn't need `keys` any longer if it's a two-state transition/reveal.

```jsx
<Transition
    from={{ opacity: 0 }} 
    enter={{ opacity: 1 }} 
    leave={{ opacity: 0 }}>
    {toggle ? ComponentA : ComponentB}
</Transition>
```

## 3.0.0

Breaking changes:

* SpringTrail -> Trail
* SpringTransition -> Transition

New primitives:

* Parallax