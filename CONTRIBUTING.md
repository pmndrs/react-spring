# How to Contribute

1. Clone this repository:

```sh
git clone https://github.com/react-spring/react-spring -b v9
cd react-spring
```

2. Install `yarn` (https://yarnpkg.com/en/docs/install)

3. Bootstrap the packages:

```sh
yarn

# Clone the docs and examples (optional)
yarn meta git update
```

4. Link the packages:

```sh
# Use the .js bundles
yarn lerna exec 'cd dist && yarn link || exit 0'

# Or use the uncompiled .ts packages
yarn lerna exec 'yarn link'
```

5. Link `react-spring` to your project:

```sh
cd ~/my-project
yarn link react-spring
```

6. Let's get cooking! 👨🏻‍🍳🥓

## Guidelines

Be sure your commit messages follow this specification: https://www.conventionalcommits.org/en/v1.0.0-beta.4/

### Duplicate `react` errors

React 16.8+ has global state to support its "hooks" feature, so you need to ensure only one copy of `react` exists in your program. Otherwise, you'll most likely see [this error](https://reactjs.org/warnings/invalid-hook-call-warning.html). Please try the following solutions, and let us know if it still doesn't work for you.

- **For `create-react-app` users:** Follow this guide: https://github.com/facebook/react/issues/13991#issuecomment-496383268

- **For `webpack` users:** Add an alias to `webpack.config.js` like this:

  ```js
  alias: {
    react: path.resolve('node_modules/react'),
  }
  ```

- **For `gatsby` users:** Install `gatsby-plugin-alias-imports` and add this to your `gatsby-config.js` module:
  ```js
  {
    resolve: `gatsby-plugin-alias-imports`,
    options: {
      alias: {
        react: path.resolve('node_modules/react'),
      },
    },
  },
  ```

# Publishing

To publish a new version:

```
yarn release
```

To publish a **canary** version:

```
yarn release --canary
```
