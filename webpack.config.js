const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: process.env.MODE,
    entry: path.resolve('src/index.js'),
    output: {
        filename: 'main.[hash].js',
        path: path.resolve('dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    plugins: [
      new HtmlWebpackPlugin({
          template: path.resolve('public/index.html'),
          hash: true,
          inject: false,
          title: 'Batch Transfer',
          favicon: path.resolve('public/favicon.png')

      }),
    ],
    devServer: {
        port: 8080,
        hot: true,
        open: true,
        https: false,
        host: '0.0.0.0',
        useLocalIp: true,
    },
    watchOptions: {
        ignored: /node_modules/
    }
}