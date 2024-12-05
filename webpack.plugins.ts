import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'node_modules/monaco-editor/min/vs'),
        to: 'vs', // Output directory in the build folder
      },
    ],
  }),
];
