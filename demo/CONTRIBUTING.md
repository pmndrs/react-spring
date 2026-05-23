# Contributing a new demo

Thanks for the interest! Before reading on, have a look at the repo's [contribution guide](../CONTRIBUTING.md).

## What's required

Demos are based on the CodeSandbox `react-typescript` template. You can either copy an existing demo and tweak it, or build one in CodeSandbox and export the code into `demo/src/sandboxes/<your-demo>/`.

Each demo follows this structure:

```
demo/src/sandboxes/<your-demo>/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx        # entry point — imported by the demo hub
│   └── index.tsx
├── package.json
├── thumbnail.png      # 16:9, shown on the website
└── tsconfig.json      # copy from an existing demo
```

`App.tsx` is the entry the demo hub renders via Vite, so it must export a default component.

### `package.json`

- Set a clear `name` and `description` — both surface on the website.
- List the react-spring hooks you used in `keywords`.

### Thumbnail

A 16:9 PNG saved as `thumbnail.png` next to `package.json`. Make it count — this is what people see first.

## Running it locally

From the repo root:

```sh
pnpm demo:dev
```

This serves the demo hub via Vite and picks up your new sandbox automatically.

## Opening the PR

Include a CodeSandbox link, a short explanation of the demo, and why it belongs in the hub.
