# @react-spring/shared

This package contains modules which are **not imported** by the main module.

- `@react-spring/shared/src/colorMatchers`
  Regular expressions for color strings

- `@react-spring/shared/src/colors`
  The dictionary of named colors and their numeric values

- `@react-spring/shared/src/normalizeColor`
  Converts named colors, hexadecimal colors, `rgba` strings, and `hsla` strings
  into their numeric values

- `@react-spring/shared/src/stringInterpolation`
  Exports the `createStringInterpolator` function (with color support)

## Main module

Import `@react-spring/shared` to access these named imports:

- `Globals` object (updated with its `assign` method)
- `createInterpolator` function
- `is` functions (for runtime type checks)
- Utility hooks (like `useForceUpdate`)
- Every type in `src/types`
