import fs from 'fs';
import path from 'path';
import { Dimension } from 'types/dimension';
import { Variant } from 'types/variant';
import { compareChildren } from './load-requests-tree';

/**
 * Reads the filesystem to construct the dimensions.
 *
 * @param projPath The path of the project directory.
 * @returns An object that contains dimensions, variants, and dimension ordering. If the project
 * contains no dimensions, undefined is returned.
 */
export function loadDimensions(projPath: string) {
  const dirPath = path.join(projPath, 'dimensions');

  if (!fs.existsSync(dirPath)) {
    return;
  }

  if (fs.statSync(dirPath).isFile()) {
    throw new Error(`Invalid project: \`${dirPath}\` is a file. This must be a directory.`)
  }

  const dimMap: Record<string, Dimension> = {};
  const varMap: Record<string, Variant> = {};
  const ordering = loadDimensionsOrdering(projPath);

  const dimIds = fs.readdirSync(dirPath)
    .filter(name => fs.statSync(path.join(dirPath, name)).isDirectory())
    .map(name => loadDimension(projPath, name, dimMap, varMap))
    .sort((a, b) => compareChildren(a, b, ordering));

  return {
    dimensions: dimMap,
    variants: varMap,
    dimOrder: dimIds,
  };
}


/**
 * Loads a dimension and its variants from disk.
 *
 * @param projPath The directory path of the project.
 * @param name The name of the dimension.
 * @param dimMap A map that contains all dimensions of the project.
 * @param varMap A map that contains all variants of the project.
 * @returns The dimension id.
 */
function loadDimension(projPath: string, name: string, dimMap: Record<string, Dimension>,
  varMap: Record<string, Variant>)
{
  const dimPath = path.join(projPath, 'dimensions', name);
  const id = path.relative(projPath, dimPath);

  dimMap[id] = {
    name,
    variants: loadVariants(projPath, dimPath, varMap)
  };

  return id;
}

/**
 * Loads dimension variants from disk.
 *
 * @param projPath The directory path of the project.
 * @param dimPath The directory path of the dimension.
 * @param varMap A map that contains all variants of the project.
 * @returns A list of variant ids.
 */
function loadVariants(projPath: string, dimPath: string, varMap: Record<string, Variant>) {
  const filenames = getVariantFilenames(dimPath);
  const ordering = loadVariantOrdering(dimPath);
  return filenames
    .map(filename => loadVariant(projPath, dimPath, filename, varMap))
    .sort((a, b) => compareChildren(a, b, ordering));
}

/**
 * Gets dimension variant filenames from disk.
 *
 * @param dimPath The directory path of the dimension.
 * @returns A list of variant filenames.
 */
function getVariantFilenames(dimPath: string) {
  const dirPath = path.join(dimPath, 'variants');
  try {
    return fs.readdirSync(dirPath)
      .filter(name => fs.statSync(path.join(dirPath, name)).isFile() &&
        name.toLocaleLowerCase().endsWith('.json'));
  } catch (error) {
    return [];
  }
}

/**
 * Loads a variant file from disk and insert variant into varMap.
 *
 * @param projPath The directory path of the project.
 * @param dimPath The directory path of the dimension.
 * @param filename The filename of the variant.
 * @param varMap The map that contains all variants in the project.
 * @returns The id of the variant.
 */
function loadVariant(projPath: string, dimPath: string, filename: string,
  varMap: Record<string, Variant>)
{
  const filePath = path.join(dimPath, 'variants', filename);
  const name = path.basename(filename, '.json');
  const id = path.relative(projPath, path.join(dimPath, 'variants', name));

  let variant;

  try {
    const str = fs.readFileSync(filePath, 'utf-8');
    variant = JSON.parse(str);
  } catch (error) {
    variant = {};
  }

  varMap[id] = { name, ...variant};

  return id;
}

/**
 * Gets ordering of the dimensions from `dimensions.json`.
 *
 * @param projPath The directory project of the project.
 */
function loadDimensionsOrdering(projPath: string) {
  try {
    const filePath = path.join(projPath, 'dimensions', 'dimensions.json');
    const str = fs.readFileSync(filePath, 'utf-8');
    const metadata = JSON.parse(str);
    const children = metadata?.children as string[];
    return Array.isArray(children) ?
      children.reduce((a, c, i) => a.set(c, i), new Map<string, number>()) :
      new Map<string, number>();
  } catch (error) {
    return new Map<string, number>();
  }
}

/**
 * Get variant ordering from `dimension.json`.
 *
 * @param dimPath The directory path of the dimension.
 * @returns A map that maps the children name to index.
 */
function loadVariantOrdering(dimPath: string) {
  try {
    const filePath = path.join(dimPath, 'dimension.json');
    const str = fs.readFileSync(filePath, 'utf-8');
    const metadata = JSON.parse(str);
    const children = metadata?.children as string[];
    return Array.isArray(children) ?
      children.reduce((a, c, i) => a.set(c, i), new Map<string, number>()) :
      new Map<string, number>();
  } catch (error) {
    return new Map<string, number>();
  }
}
