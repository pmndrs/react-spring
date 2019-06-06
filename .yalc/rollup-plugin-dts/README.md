# rollup-plugin-dts

[![Build Status](https://img.shields.io/travis/Swatinem/rollup-plugin-dts.svg)](https://travis-ci.org/Swatinem/rollup-plugin-dts)
[![Coverage Status](https://img.shields.io/codecov/c/github/Swatinem/rollup-plugin-dts.svg)](https://codecov.io/gh/Swatinem/rollup-plugin-dts)

This is a plugin that lets you roll-up your `.d.ts` definition files.

## Usage

Install the package from `npm`:

    $ npm install --save-dev rollup-plugin-dts

Add it to your `rollup.config.js`:

```js
import dts from "rollup-plugin-dts";

const config = [
  // …
  {
    input: "./my-input/index.d.ts",
    output: [{ file: "dist/my-library.d.ts", format: "es" }],
    plugins: [dts()],
  },
];

export default config;
```

And then instruct typescript where to find your definitions inside your `package.json`:

```json
  "types": "dist/my-library.d.ts",
```

**NOTE** that the plugin will automatically mark any external library
(`@types` for example) as `external`, so those will be excluded from bundling.

## Prerequisites

The plugin works by consuming pre-generated `.d.ts` files. So you will need to
set up your `tsc` compiler or any other tool to output `.d.ts` files.
You can do so by specifying either `declaration: true`
or `emitDeclarationOnly: true` in your `tsconfig.json` file. Then point
rollup to the output.

## Why?

Well, ideally TypeScript should just do all this itself, and it even has a
[proposal](https://github.com/Microsoft/TypeScript/issues/4433) to do that.
But there hasn’t been any progress in ~3 years.

Some projects, like [rollup itself](https://github.com/rollup/rollup/blob/24fe07f39da8e4225f4bc4f797331930d8405ec2/src/rollup/types.d.ts)
go the route of completely separating their public interfaces in a separate file.

## Alternatives

- [API Extractor](https://api-extractor.com/)
- [dts-bundle-generator](https://github.com/timocov/dts-bundle-generator)

[See](https://github.com/Swatinem/rollup-plugin-dts/issues/5)
[some](https://github.com/Swatinem/rollup-plugin-dts/issues/13)
[discussions](https://github.com/timocov/dts-bundle-generator/issues/68)
about all three of these projects and their tradeoffs.

## [How does it work](./docs/how-it-works.md)
