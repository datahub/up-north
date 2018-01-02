var webpack = require('webpack');
var ExtractPlugin = require('extract-text-webpack-plugin');
var production = process.env.NODE_ENV === 'production';

var plugins = [
    new ExtractPlugin('styles.css'),
];
if (production) {
    plugins = plugins.concat([
        new webpack.optimize.UglifyJsPlugin({
            mangle:   true,
            compress: {
                warnings: false
            },
        }),
        new webpack.DefinePlugin({
            __SERVER__:      !production,
            __DEVELOPMENT__: !production,
            __DEVTOOLS__:    !production,
            'process.env':   {
                BABEL_ENV: JSON.stringify(process.env.NODE_ENV),
            },
        })
    ]);
}

module.exports = {
    entry: "./src",
    output: {
        path: 'dist',
        filename: 'bundle.js'
    },
    devServer: {
        inline: true,
        contentBase: 'dist',
        colors: true,
        open: true
    },
    debug: !production,
    devtool: production ? false : 'eval',
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                loader: 'eslint',
            }
        ],
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?{ presets: "es2015" }'
            },
            {
                test:   /\.scss$/,
                loader: ExtractPlugin.extract('style', 'css!sass'),
            },
            {
                test:   /\.html$/,
                loader: 'html',
            },
            {
                test: /\.(csv|tsv|txt|json)$/,
                loader: 'file?name=data/[name].[ext]'
            },
            {
                test: /\.(jpe?g|png|svg)$/,
                loaders: [
                    'file?name=media/[name].[ext]',
                    'image-webpack?{ mozjpeg: { quality: 80 }, pngquant: { quality: "75-90", speed: 2 }}'
                ]
            }
        ]
    },
    plugins: plugins
}
