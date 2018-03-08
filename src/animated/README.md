# Animated

Declarative Animations Library for React and React Native

See the [interactive docs](http://animatedjs.github.io/interactive-docs/).


## Goal

The goal of this repo is to provide an implementation of the Animated library
that is currently provided by React Native that can also be used by React in
a web context. At some point, React Native will itself depend on this library.

Additionally, it would be ideal if this library would be compatible with future
potential "targets" of React where animation makes sense.


## Usage (Still Theoretical)

Right now the main export of this library is essentially just what is in the
`Animated` namespace in React Native, minus the `View`, `Image`, and `Text`
namespace. Additionally, it includes an `inject` namespace (explained below).

Ideally, I'd like to make it so that `View`, `Image`, and `Text` are exported,
and just do the "right thing" depending on whether or not they are being used
in the context of React Native or React Web.  I'm not quite sure how we can do
this yet without declaring dependencies on react native. Perhaps the platform
specific file extensions can be used for this?


### Injectables

There are several parts of this library that need to have slightly different
implementations for react-dom than for react-native. At the moment, I've just
made these things "injectable" so that this library can stay dependent on only
react.

Some of these I am implementing as "injectable", even though right now it would
technically work for both platforms. This doesn't hurt anything, and attempts to
make this library more compatible with future "targets" for react.

The injectable modules are available off of the `Animated.inject` namespace,
and include:

- `ApplyAnimatedValues`
- `FlattenStyle`
- `InteractionManager`
- `RequestAnimationFrame`
- `CancelAnimationFrame`

Each of these modules can be injected by passing in the implementation. For
example, a naive `FlattenStyle` could be passed in as:

```js
Animated.inject.FlattenStyle(
  styles => Array.isArray(styles)
    ? Object.assign.apply(null, styles)
    : styles
);
```