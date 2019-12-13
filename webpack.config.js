const path = require('path');

module.exports = {
  entry: './src/main-element.js',
  output: {
    filename: 'main-element.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
