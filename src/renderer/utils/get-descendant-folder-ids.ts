import { Project } from "types/project";

/**
 * Get all descendant folder ids of a folder including the id of the folder itself.
 *
 * @param project The project object.
 * @param folderId The folder id
 * @returns A list of folder ids under the folder.
 */
export default function getDescendantFolderIds(project: Project, folderId: string): string[] {
  const folder = project?.folders?.[folderId];

  if (!folder) {
    return [];
  }

  return [
    folderId,
    ...(folder.folders?.reduce((a, c) => [...a, ...getDescendantFolderIds(project, c)], []) ?? [])
  ];
}
