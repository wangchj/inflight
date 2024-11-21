import type { Configuration } from 'webpack';
import path from 'path';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

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
  plugins,
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
  },
};
