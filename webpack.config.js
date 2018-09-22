const path = require('path');
const { peerDependencies } = require('./package.json');

const generateCommonJSExternals = libs => libs.reduce((acc, lib) => ({ ...acc, [lib]: `commonjs ${lib}`}), {});

module.exports = {
  mode: 'production',
  entry: path.join(__dirname, './src/fireRTC.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    library: 'fire-rtc',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /(node_modules|dist)/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]
  },
  externals: generateCommonJSExternals(Object.keys(peerDependencies))
};


