# How to Contribute

1. Clone this repository:

```sh
git clone https://github.com/react-spring/react-spring
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

- Be sure your commit messages follow this specification: https://www.conventionalcommits.org/en/v1.0.0-beta.4/

- If your dev environment has poor support for symlinks, you can try using
  [relative-deps](https://github.com/mweststrate/relative-deps). Let us know if
  this setup doesn't work for you.
