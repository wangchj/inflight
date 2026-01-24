import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import dotenv from 'dotenv';
import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

dotenv.config();

console.log('----------------', process.env.MSIX_PUBLISHER, process.env.MSIX_PACKAGE_IDENTITY);

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'icon',
    osxSign: { // object must exist even if empty
      identity: process.env.APPLE_CERT_ID,
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID ?? '',
      appleIdPassword: process.env.APPLE_PASSWORD ?? '',
      teamId: process.env.APPLE_TEAM_ID ?? '',
    },
  },
  rebuildConfig: {},
  makers: [
    // new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
    {
      name: '@electron-forge/maker-msix',
      config: {
        sign: false,
        manifestVariables: {
          publisher: process.env.MSIX_PUBLISHER,
          publisherDisplayName: process.env.MSIX_PUBLISHER_DISPLAY_NAME,
          packageIdentity: process.env.MSIX_PACKAGE_IDENTITY,
        },
      },
    },
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
