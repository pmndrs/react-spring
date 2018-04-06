const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = env => {
    return {
        mode: 'development',
        entry: ['webpack-dev-server/client?http://localhost:8080', 'index.js'],
        output: { filename: 'dist/bundle.js', path: path.resolve('./') },
        module: {
            rules: [
                { test: /\.css$/, use: ['style-loader', 'css-loader'], exclude: /node_modules/ },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            presets: ['@babel/preset-env', '@babel/preset-stage-0', '@babel/preset-react'],
                        },
                    },
                },
            ],
        },
        resolve: {
            modules: [path.resolve('./'), 'node_modules'],
            extensions: ['.js', '.jsx'],
            alias: { 
                'react': path.resolve(__dirname, 'node_modules/react'),
                'react-spring': path.resolve(__dirname, '../src/index.js') 
            }
        },
        plugins: [new HtmlWebpackPlugin({ template: 'template.html' })],
        devServer: { hot: false, contentBase: path.resolve('./'), stats: 'errors-only' },
        devtool: undefined,
        performance: { hints: false },
    }
}
