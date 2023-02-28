# Contributing a new demo

## Preface

Thanks for being interested in contributing a demo! Before you read more, have you read the [contribution guide](https://github.com/pmndrs/react-spring/blob/main/CONTRIBUTING.md) for the repo? If not, give it a look first!

## What is required

All our demos are based on codesandbox templates for react-typescript. If you're going to contribute a
demo, you can either copy an existing demo and tweak it or create a new one in codesandbox, export the
code and add it to the repo.

You should ensure your demo follows the same structure as the other ones:

```
- public
- src
- - App.tsx
- - index.tsx
- .pretterrc
- package.json
- tsconfig.json // I would copy this from an existing one
- thumbnail.png
```

This is the minimum we require as the `App.tsx` is used to integrate with our demo hub via vite in the repo.

A few other things to remember

### Thumbnail

This should be included to showcase your work best! Make sure it's a 16:9 ratio.

### Package.json

Ensure there's a clear name and description as these appear on the website. You should also use `tags` to highlight keywords
especially the `react-spring` hooks you've used.

## When you're ready

When you've finished adding your code, open a PR explaining the example, why you think it should be included
and most importantly, include a sandbox link so it can be looked at and admired!
