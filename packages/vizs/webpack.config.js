const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const CopyPlugin = require("copy-webpack-plugin");
const { getThemeVariables } = require('antd/dist/theme');

module.exports = {
  entry: "./src/bootstrap.js",
  cache: false,

  mode: "development",
  devtool: "source-map",

  optimization: {
    minimize: false,
  },

  output: {
    publicPath: "http://localhost:3005/",
  },

  resolve: {
    extensions: [".jsx", ".js", ".json"],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: require.resolve("babel-loader"),
        options: {
          presets: [require.resolve("@babel/preset-react")],
          plugins: [
            [
              "import",
              {
                libraryName: "antd",
                style: true,
              },
            ],
          ],
        },
      },
      {
        test: /\.md$/,
        loader: "raw-loader",
      },
      {
        test: /\.(sass|less|css)$/,
        use: [
            {
                loader: "style-loader",
            },
            {
                loader: "css-loader",
            },
            {
                loader: "less-loader",
                options: {
                  lessOptions: {
                      javascriptEnabled: true,
                      modifyVars: getThemeVariables({
                                dark: true, // 开启暗黑模式
                                compact: true, // 开启紧凑模式
                     }),
                  }
              }
            },
        ],
    },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: "resources",
      library: { type: "var", name: "resources" },
      filename: "remoteEntry.js",
      remotes: {},
      exposes: {
        "./viz.Test": "./src/viz/Test",
        "./form.Test": "./src/form/Test",
        "./form.Input": "./src/form/Input",
        "./form.Select": "./src/form/Select",
        "./viz.Line": "./src/viz/Line",
      },
      shared: { react: { singleton: true }, "react-dom": { singleton: true } },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
