# How to Contribute

1. Clone this repository:

```sh
git clone https://github.com/pmndrs/react-spring
cd react-spring
```

2. Install `yarn` (https://yarnpkg.com/en/docs/install)

3. Preconstuct will link the packages up in a postinstall function

4. Let's get cooking! 👨🏻‍🍳🥓

## Guidelines

Be sure your commit messages follow this specification: https://www.conventionalcommits.org/en/v1.0.0-beta.4/

### Windows permission errors

Some Windows users may need to [enable developer mode](https://howtogeek.com/292914/what-is-developer-mode-in-windows-10) if experiencing `EPERM: operation not permitted, symlink` with Preconstruct. If this persists, you might be running on an unsupported drive/format. In which case, consider using [Docker](https://docs.docker.com/docker-for-windows).

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

We use [`changesets`](https://github.com/atlassian/changesets) to publish our package now.
All our dependencies are fixed using ~ after [1414](https://github.com/pmndrs/react-spring/issues/1414) but luckily changesets will bump them for every minor version we release.

## Simple release

You want to release some new features that haven't been released yet:

```shell
yarn changeset:add
```

Follow the prompt to flag which packages need to update although with `react-spring` we keep all our packages at the same version.

Then you'll run:

```shell
yarn vers
```

This will update all the packages correctly according to what version you just set with the `add` script & possibly update the deps within those packages.

Finally:

```shell
yarn release
```

This will build the packages, publish them & push the tags to github to signify a new release. Please then update the `releases` on github & the changelog on `react-spring.io`

## Prerelease

Everything above applies but you must first run:

```shell
yarn changeset pre enter beta | alpha | next
```

If you find you're stuck in a prerelease and trying to do a Simple Release, try running:

```shell
yarn changeset pre exit
```
