const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CreateFileWebpack = require('create-file-webpack');
const { GenerateSW } = require('workbox-webpack-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = env => {
    const isDevMode = !env.production;
    const webcomponentsjs = './node_modules/@webcomponents/webcomponentsjs';

    const polyfills = [
        {
            from: path.resolve(`${webcomponentsjs}/webcomponents-*.{js,map}`),
            to: 'vendor/[name][ext]',
        },
        {
            from: path.resolve(`${webcomponentsjs}/bundles/*.{js,map}`),
            to: 'vendor/bundles/[name][ext]',
        },
        {
            from: path.resolve(`${webcomponentsjs}/custom-elements-es5-adapter.js`),
            to: 'vendor/[name][ext]',
        },
    ];

    const assets = [
        {
            from: 'static/',
            to: 'static/',
        },
    ];

    const plugins = [
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
            'isProduction': !isDevMode,
        }),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/index.html',
            minify: {
                collapseWhitespace: true,
                minifyCSS: true,
                minifyJS: true
            }
        }),
        new CopyWebpackPlugin({
            patterns: [...polyfills, ...assets],
        }),
        new WasmPackPlugin({
            crateDirectory: __dirname,
            forceMode: 'production', // To slow otherwise
        }),
        new MiniCssExtractPlugin(),
        new CreateFileWebpack({ path: 'dist', fileName: '.nojekyll', content: '' }),
    ];

    if (!isDevMode) {
        plugins.push(
            new GenerateSW({
                exclude: [/\.(json|bin)$/, /vendor.*bundle/],
                cleanupOutdatedCaches: true,
                runtimeCaching: [
                    {
                        urlPattern: /vendor.*bundle/,
                        handler: 'CacheFirst',
                    },
                    {
                        urlPattern: /\.bin$/,
                        handler: 'CacheFirst',
                    },
                    {
                        urlPattern: /\.json$/,
                        handler: 'NetworkFirst',
                    }
                ],
            }),
        )
    }

    return {
        mode: isDevMode ? 'development' : 'production',
        devtool: 'inline-source-map',
        entry: './src/index.js',
        output: {
            filename: '[name].[chunkhash:8].js',
            path: path.resolve(__dirname, "dist"),
        },
        experiments: {
            asyncWebAssembly: true,
        },
        devServer: {
            hot: true,
            compress: true,
            host: '0.0.0.0',
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
                    test: /\.svg$/i,
                    use: 'svg-inline-loader'
                },
                {
                    test: /\.glsl$/i,
                    use: 'raw-loader'
                },
                {
                    test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
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
};

