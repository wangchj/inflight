import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';
import type { Configuration } from 'webpack';
import { DefinePlugin } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { rulesRenderer } from './webpack.rules';
import { pluginsUI } from './webpack.plugins';

// Combine configuration type
type Config =  Configuration & {
  devServer?: DevServerConfiguration;
};

module.exports = {
  entry: './src/renderer.tsx',
  module: {
    rules: rulesRenderer,
  },
  plugins: [
    ...pluginsUI,
    new DefinePlugin({
      WEB_BUILD: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html'
    }),
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
  devServer: {
    port: 3000,
  },
} as Config;
