import fs from 'fs';
import path from 'path';
import { Folder } from 'types/folder';
import { Request } from 'types/request';

/**
 * Reads the filesystem to construct the requests tree.
 *
 * @param projPath The path of the project directory.
 * @returns An object that contains the root folder id and a collection of folders and a collection
 * of requests. If the requests folder does not exist, undefined is returned.
 */
export function loadRequestsTree(projPath: string) {
  const dirPath = path.join(projPath, 'requests');

  if (!fs.existsSync(dirPath)) {
    return;
  }

  if (fs.statSync(dirPath).isFile()) {
    throw new Error(`Invalid project: \`${dirPath}\` is a file. This must be a directory.`);
  }

  const foldersMap: Record<string, Folder> = {};
  const requestsMap: Record<string, Request> = {};
  const root = makeNode(projPath, projPath, 'requests', foldersMap, requestsMap);

  if (root?.type === 'request') {
    throw new Error("Invalid project: requests tree root is a request.");
  }

  return root ? {
    tree: root.id,
    folders: foldersMap,
    requests: requestsMap,
  } : undefined;
}

/**
 * Makes a node (request or folder) from a directory.
 *
 * @param projPath The directory path of the folder.
 * @param parentPath The parent directory path of the current directory.
 * @param name The name of the directory.
 * @param foldersMap The map that contains all folders.
 * @param requestsMap The map that contains all requests.
 * @returns An object that contains the node type (folder or request) and the id, or undefined if
 * the directory does not exist.
 */
function makeNode(
  projPath: string,
  parentPath: string,
  name: string,
  foldersMap: Record<string, Folder>,
  requestsMap: Record<string, Request>
) : {type: 'request' | 'folder', id: string} | undefined {
  /**
   * The path of this node.
   */
  const dirPath = path.join(parentPath, name);

  if (!fs.existsSync(dirPath)) {
    return;
  }

  /**
   * The children (files or folders) of this directory.
   */
  const children = fs.readdirSync(dirPath);

  /**
   * Determines if this directory is a request.
   */
  const isRequest = children.includes('request.json');

  return isRequest ?
    makeRequestNode(projPath, dirPath, requestsMap) :
    makeFolderNode(projPath, dirPath, name, children, foldersMap, requestsMap);
}

/**
 * Makes request node from request directory path. This function is only called from makeNode().
 *
 * @param projPath The project directory path.
 * @param dirPath The request directory path.
 * @param requestsMap The map that contains all requests.
 * @returns An object that contains the node type and the id, or undefined if the directory does not
 * exist.
 */
function makeRequestNode(projPath: string, dirPath: string, requestsMap: Record<string, Request>):
  {type: 'request', id: string} | undefined
{
  const nodeId = path.relative(projPath, dirPath);
  const request = loadRequest(dirPath);

  if (request) {
    requestsMap[nodeId] = request;
    return {
      type: 'request',
      id: nodeId,
    };
  }
}

/**
 * Loads a request from disk.
 *
 * @param dirPath The path of the request directory.
 * @return The request model object or undefined if the file can't be opened or parsed.
 */
function loadRequest(dirPath: string): Request | undefined {
  try {
    const filePath = path.join(dirPath, 'request.json');
    const str = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(str);
  } catch (error) {
    return;
  }
}

/**
 * Makes a folder node from path. This function is only called from makeNode().
 *
 * @param projPath The project directory path.
 * @param dirPath The directory path of the folder.
 * @param name The directory name of the folder.
 * @param children The list of children of the folder directory on dis.
 * @param foldersMap The map that contains all folders.
 * @param requestsMap The map that contains all requests.
 * @returns
 */
function makeFolderNode(projPath: string, dirPath: string, name: string, children: string[],
  foldersMap: Record<string, Folder>, requestsMap: Record<string, Request>, ):
  {type: 'folder', id: string} | undefined
{
  const nodeId = path.relative(projPath, dirPath);
  const ordering = loadFolderChildrenOrdering(dirPath);
  const nodes = children
    .filter(child => fs.statSync(path.join(dirPath, child)).isDirectory())
    .map(child => makeNode(projPath, dirPath, child, foldersMap, requestsMap))
    .filter(node => !!node);
  const folders = nodes.filter(node => node.type === 'folder').map(node => node.id);
  const requests = nodes.filter(node => node.type === 'request').map(node => node.id);

  if (ordering) {
    folders.sort((a, b) => compareChildren(a, b, ordering));
    requests.sort((a, b) => compareChildren(a, b, ordering));
  }

  foldersMap[nodeId] = { name, folders, requests };

  return {
    type: 'folder',
    id: nodeId
  };
}

/**
 * Get folder children ordering from `folder.json`.
 *
 * @param dirPath The directory path of the folder.
 * @return A map that maps the children name to index or undefined.
 */
function loadFolderChildrenOrdering(dirPath: string): Map<string, number> | undefined {
  try {
    const filePath = path.join(dirPath, 'folder.json');
    const str = fs.readFileSync(filePath, 'utf-8');
    const metadata = JSON.parse(str);
    const children = metadata?.children as string[];
    return Array.isArray(children) ?
      children.reduce((a, c, i) => a.set(c, i), new Map<string, number>()) :
      new Map<string, number>();
  } catch (error) {
    return;
  }
}

/**
 * Folder children sort comparator function.
 *
 * @param path1 The path of the first children.
 * @param path2 The path of the second children.
 * @param ordering The ordering name to index map.
 * @returns Same as array sort compare function.
 */
export function compareChildren(path1: string, path2: string, ordering: Map<string, number>) {
  const name1 = path.basename(path1);
  const name2 = path.basename(path2);
  const index1 = ordering?.get(name1) ?? Number.MAX_SAFE_INTEGER;
  const index2 = ordering?.get(name2) ?? Number.MAX_SAFE_INTEGER;
  return index1 - index2;
}
