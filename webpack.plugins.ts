import CopyWebpackPlugin from 'copy-webpack-plugin';
import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

/**
 * Webpack plug-ins for both the main process and renderer.
 */
export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
];

/**
 * Webpack plug-ins for both the renderer and web UI.
 */
export const pluginsUI = [
  /**
   * Get the plug-ins from the base plug-in list
   */
  ...plugins,

  /**
   * Copy Manaco assets.
   */
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'node_modules/monaco-editor/min/vs'),
        to: 'vs', // Output directory in the build folder
      },
    ],
  }),
]
