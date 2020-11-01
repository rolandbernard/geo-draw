const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webcomponentsjs = './node_modules/@webcomponents/webcomponentsjs';

const polyfills = [
    {
        from: path.resolve(`${webcomponentsjs}/webcomponents-*.{js,map}`),
        to: 'vendor',
        flatten: true
    },
    {
        from: path.resolve(`${webcomponentsjs}/bundles/*.{js,map}`),
        to: 'vendor/bundles',
        flatten: true
    },
    {
        from: path.resolve(`${webcomponentsjs}/custom-elements-es5-adapter.js`),
        to: 'vendor',
        flatten: true
    },
];

const assets = [
    {
        from: 'static/',
        to: 'static/'
    },
];

const plugins = [
    new CleanWebpackPlugin(['dist']),
    new webpack.ProgressPlugin(),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html',
        minify: {
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        }
    }),
    new CopyWebpackPlugin([...polyfills, ...assets], {
        ignore: ['.DS_Store']
    }),
    new MiniCssExtractPlugin(),
];

module.exports = {
    entry: './src/index.js',
    output: {
        filename: '[name].[chunkhash:8].js',
        path: path.resolve(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: ['@babel/plugin-syntax-dynamic-import', '@babel/plugin-transform-runtime'],
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: '>1%, not dead, ie 11',
                            }
                        ]
                    ]
                }
            },
            {
                test: /\.s?css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                            esModule: false,
                        }
                    }
                ]
            }
        ]
    },
    plugins: plugins,
};