import dotenv from 'dotenv';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Configuration } from 'webpack';
import { DefinePlugin } from 'webpack';
import path from 'path';
import { rulesWeb } from './webpack.rules';
import { pluginsUI } from './webpack.plugins';

dotenv.config();

module.exports = {
  target: 'web',
  entry: './src/renderer.tsx',
  output: {
    path: path.resolve(__dirname, 'out', 'web'),
  },
  module: {
    rules: rulesWeb,
  },
  plugins: [
    ...pluginsUI,
    new DefinePlugin({
      WEB_BUILD: true,
    }),
    new HtmlWebpackPlugin({
      template: './src/index-web.html',
      GA_MEASURE_ID: process.env.GA_MEASURE_ID
    }),
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
} as Configuration;
