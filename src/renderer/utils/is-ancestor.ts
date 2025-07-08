import { Project } from "types/project";

/**
 * Determines if project tree node a (identified by i1) is a strict ancestor of node b (identified
 * by i2).
 *
 * @param project The project of the nodes.
 * @param i1 The id of node a.
 * @param i2 The id of the second node.
 * @returns True if a is a strict ancestor of b.
 */
export default function isAncestor(project: Project, i1: string, i2: string): boolean {
  const a = project.folders?.[i1];

  if (a?.folders?.includes(i2) || a?.requests?.includes(i2)) {
    return true;
  }

  return a?.folders?.reduce((a, c) => a || isAncestor(project, c, i2), false) ?? false;
}
