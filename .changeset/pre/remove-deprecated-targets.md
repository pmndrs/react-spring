---
'@react-spring/web': major
---

refactor!: remove deprecated targets and the `react-spring` umbrella

Removes the deprecated `@react-spring/native`, `@react-spring/konva`, and `@react-spring/zdog` targets (along with the React Native hook variants), plus the `react-spring` umbrella package. Install a target directly — `@react-spring/web` or `@react-spring/three`.

For React Native, use [Reanimated](https://docs.swmansion.com/react-native-reanimated/) — its springs run on the UI thread, unlike react-spring's JS-thread engine.
