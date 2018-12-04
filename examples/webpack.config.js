const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin
const webpack = require('webpack')

console.log(path.resolve('../node_modules/react'))

module.exports = mode => {
  return {
    mode,
    entry: 'index.js',
    output: { filename: 'bundle.js', path: path.resolve('./dist') },
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        {
          test: /\.jsx?$/,
          sideEffects: true,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              presets: [
                [
                  '@babel/preset-env',
                  {
                    modules: false,
                    loose: true,
                    ...(mode.production
                      ? { useBuiltIns: 'usage', targets: { chrome: 61 } }
                      : {
                          useBuiltIns: false,
                          targets: { browsers: 'last 2 Chrome versions' },
                        }),
                  },
                ],
                '@babel/preset-react',
              ],
              plugins: mode.production
                ? [
                    [
                      '@babel/transform-runtime',
                      {
                        helpers: true,
                        polyfill: false,
                        regenerator: false,
                        moduleName: '@babel/runtime',
                      },
                    ],
                    'babel-plugin-lodash',
                  ]
                : [
                    '@babel/plugin-syntax-dynamic-import',
                    ['@babel/plugin-proposal-decorators', { legacy: true }],
                    ['@babel/proposal-class-properties', { loose: true }],
                  ],
            },
          },
        },
      ],
    },
    resolve: {
      modules: [path.resolve('./'), 'node_modules'],
      extensions: ['.js', '.jsx'],
      alias: {
        react: path.resolve('../node_modules/react'),
        'react-dom': path.resolve('../node_modules/react-dom'),
        'prop-types': path.resolve('node_modules/prop-types'),
        'react-spring': path.resolve('../src/targets/web/'),
        lodash: path.resolve(__dirname, 'node_modules/lodash-es'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'template.html' }),
      new LodashModuleReplacementPlugin(),
      new webpack.LoaderOptionsPlugin({ minimize: true, debug: false }),
      new BundleAnalyzerPlugin({
        openAnalyzer: false,
        analyzerMode: 'static',
        defaultSizes: 'gzip',
      }),
    ],
    devServer: {
      hot: false,
      contentBase: path.resolve('./'),
      stats: 'errors-only',
    },
    devtool: undefined,
    optimization: {
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minChunks: 1,
        maxAsyncRequests: 10,
        maxInitialRequests: 10,
        automaticNameDelimiter: '~',
        name: true,
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -5,
          },
        },
      },
    },
    performance: { hints: false },
  }
}
