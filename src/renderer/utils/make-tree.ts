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
    ...(folder?.folders?.map(folderId => makeFolderNode(project, folderId, rootId)) ?? []),
    ...(folder?.requests?.map(requestId => makeRequestNode(project, requestId, rootId)) ?? [])
  ]
  .filter(node => !!node);
}

/**
 * Makes a folder node.
 *
 * @param project The project object.
 * @param folderId The folder id.
 * @param parentId The id of the parent folder.
 * @returns A folder node or undefined.
 */
function makeFolderNode(project: Project, folderId: string, parentId: string): TreeNodeData {
  const folder = project.folders?.[folderId];

  if (!folder) {
    return;
  }

  return {
    value: folderId,
    label: folder.name,
    children: makeTree(project, folderId),
    nodeProps: {
      type: 'folder',
      parentId,
    }
  };
}

/**
 * Makes a request node.
 *
 * @param project The project object.
 * @param folderId The request id.
 * @param parentId The id of the parent folder.
 * @returns A request node or undefined.
 */
function makeRequestNode(project: Project, requestId: string, parentId: string): TreeNodeData {
  const request = project.requests?.[requestId];

  if (!request) {
    return;
  }

  return {
    value: requestId,
    label: request.name || request.url,
    nodeProps: {
      type: 'request',
      parentId,
    }
  };
}
