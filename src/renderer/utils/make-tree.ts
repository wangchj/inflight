import { TreeNodeData } from "@mantine/core";
import { Project } from "types/project";

/**
 * Makes project tree data.
 *
 * @param project The project object.
 * @param rootId The id of the root folder
 * @returns An array of TreeNodeData objects.
 */
export default function makeTree(project: Project, rootId: string): TreeNodeData[] {
  if (!project || !rootId) {
    return [];
  }

  const folder = project.folders?.[rootId];

  return [
    ...(folder?.folders?.map(folderId => makeFolderNode(project, folderId)) ?? []),
    ...(folder?.requests?.map(requestId => makeRequestNode(project, requestId)) ?? [])
  ]
  .filter(node => !!node);
}

/**
 * Makes a folder node.
 *
 * @param project The project object.
 * @param folderId The folder id.
 * @returns A folder node or undefined.
 */
function makeFolderNode(project: Project, folderId: string): TreeNodeData {
  const folder = project.folders?.[folderId];

  if (!folder) {
    return;
  }

  return {
    value: folderId,
    label: folder.name,
    children: makeTree(project, folderId),
    nodeProps: {
      type: 'folder'
    }
  };
}

/**
 * Makes a request node.
 *
 * @param project The project object.
 * @param folderId The request id.
 * @returns A request node or undefined.
 */
function makeRequestNode(project: Project, requestId: string): TreeNodeData {
  const request = project.requests?.[requestId];

  if (!request) {
    return;
  }

  return {
    value: requestId,
    label: request.name || request.url,
    nodeProps: {
      type: 'request'
    }
  };
}

// export function makeTreeNode(folder: Folder, parent: TreeNodeData, path: string): TreeNodeData {
//   const res: TreeNodeData = {
//     value: path,
//     label: path === '' ? 'Project' : folder.name,
//     nodeProps: {
//       folder,
//       parent
//     },
//   };

//   if (Array.isArray(folder.folders) && folder.folders.length > 0) {
//     const children = folder.folders.map(f => makeTreeNode(f, res, `${path}/${f.name}`))
//     res.children = children;
//   }

//   return res;
// }
