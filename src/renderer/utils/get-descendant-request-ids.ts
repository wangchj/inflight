import { Project } from "types/project";

/**
 * Get all descendent request ids of a folder.
 *
 * @param project The project object.
 * @param folderId The id of the root folder.
 * @returns A list of request ids under the folder in the project.
 */
export default function getDescendantRequestIds(project: Project, folderId: string): string[] {
  const folder = project?.folders?.[folderId];

  if (!folder) {
    return [];
  }

  return [
    ...(folder.requests ?? []),
    ...(folder.folders?.reduce((a, c) => [...a, ...getDescendantRequestIds(project, c)], []) ?? [])
  ];
}
