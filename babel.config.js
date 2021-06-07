module.exports = {
  comments: false,
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        loose: true,
        shippedProposals: true,
        targets: {
          // check this later
          esmodules: true,
        },
      },
    ],
    '@babel/preset-react',
    [
      '@babel/preset-typescript',
      {
        allowDeclareFields: true,
      },
    ],
  ],
}
