const path = require('path');

module.exports = {
  entry: './src/main-element.js',
  output: {
    filename: 'main-element.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    historyApiFallback: true,
    inline: true,
    open: true,
    hot: true
  },
  devtool: "eval-source-map",
  performance: { hints: false }
};


/*
,
node: {
fs: 'empty'
}
*/
