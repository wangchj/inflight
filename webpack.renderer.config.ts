import type { Configuration } from 'webpack';
import path from 'path';
import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';
import CopyWebpackPlugin from 'copy-webpack-plugin';

rules.push({
  test: /\.css$/,
  use: [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader'
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: {
            'postcss-preset-mantine': {},
          }
        },
      },
    }
  ],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: [
    ...plugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'node_modules/monaco-editor/min/vs'),
          to: 'main_window/vs', // Output directory in the build folder
        },
      ],
    }),
  ],
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
