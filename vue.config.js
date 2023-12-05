const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  devServer: {
    port: 8000
  },
  pages: {
    app: {
      entry: 'src/main.js',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  publicPath: process.env.BASE_URL
    ? process.env.BASE_URL
    : '/',
  chainWebpack: config => {
    config.optimization.minimizer([
      new TerserPlugin({
        terserOptions: {
          ecma: 6,
          compress: { drop_console: false }, // чистка console.*
          output: { comments: false, beautify: false } // чиста комментов
        }
      })
    ]);
  }
};
