# How to Contribute

1. Clone this repository:

```sh
git clone https://github.com/react-spring/react-spring
cd react-spring
```

2. Install `yarn` (https://yarnpkg.com/en/docs/install)

3. Bootstrap the packages:

```sh
yarn lerna bootstrap
yarn meta git update
```

4. Link the packages:

```
yarn lerna exec -- yarn link
```

5. Link `react-spring` to your project:

```sh
cd ~/my-project
yarn link react-spring
```

6. Let's get cooking!
