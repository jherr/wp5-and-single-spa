const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/bootstrap.js',
  cache: false,

  mode: 'development',
  devtool: 'source-map',

  optimization: {
    minimize: false
  },

  output: {
    publicPath: 'http://localhost:3005/'
  },

  resolve: {
    extensions: ['.jsx', '.js', '.json']
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: require.resolve('babel-loader'),
        options: {
          presets: [require.resolve('@babel/preset-react')]
        }
      },
      {
        test: /\.md$/,
        loader: 'raw-loader'
      }
    ]
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'resources',
      library: { type: 'var', name: 'resources' },
      filename: 'remoteEntry.js',
      remotes: {
      },
      exposes: {
        "./viz.Test": './src/viz/Test',
        "./form.Test": './src/form/Test'
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    }),
  ]
};
