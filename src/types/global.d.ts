/**
 * Determines if the current build is web build.
 *
 * This is defined in webpack config files (DefinePlugin).
 */
declare const WEB_BUILD: boolean;

/**
 * Determines if the current build platform is MacOS.
 *
 * This is set in `preload*.ts` and only available in renderer process (not available in web build).
 */
declare const MAC_BUILD: boolean;

/**
 * Determines if the current build platform is Windows.
 *
 * This is set in `preload*.ts` and only available in renderer process (not available in web build).
 */
declare const WIN_BUILD: boolean;
