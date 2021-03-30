module.exports = {
  comments: false,
  plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
}
