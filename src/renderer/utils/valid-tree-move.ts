import { TreeNodeData } from "@mantine/core/lib";
import { Project } from "types/project";
import isAncestor from "./is-ancestor";

/**
 * Determines if a tree node drag and drop operation is valid.
 *
 * @param project The project of the nodes.
 * @param drag The node that is being dragged (moved).
 * @param drop The node on which the dragged node is dropped.
 * @returns True if move is valid; false otherwise.
 */
export default function validTreeMove(project: Project, drag: TreeNodeData, drop: TreeNodeData):
  boolean
{
  const dragPid = drag?.nodeProps?.parentId;
  const dropPid = drop?.nodeProps?.parentId;
  const dragType = drag?.nodeProps?.type;
  const dropType = drop?.nodeProps?.type;

  if (!project || !drag?.value || !drop?.value || !dragType || !dropType) {
    return false;
  }


  switch (dragType) {
    case 'folder':
    case 'request':
      return validRequestTreeMove(project, drag, drop);

    case 'dimension':
      return validDimensionMove(project, drag, drop);

    case 'variant':
      return validVariantMove(project, drag, drop);

    default:
      return false;
  }
}

/**
 * Determines if a request or folder node drag and drop operation is valid.
 *
 * @param project The project that contains the nodes.
 * @param drag The node that is being dragged (moved).
 * @param drop The node on which the dragged node is dropped.
 * @returns True if move is valid; false otherwise.
 */
function validRequestTreeMove(project: Project, drag: TreeNodeData, drop: TreeNodeData) {
  const dragPid = drag?.nodeProps?.parentId;
  const dropPid = drop?.nodeProps?.parentId;
  const dragType = drag?.nodeProps?.type;
  const dropType = drop?.nodeProps?.type;

  if (!project || !drag?.value || !drop?.value || !dragPid || !dropPid || !dragType || !dropType ||
    (dragType !== 'folder' && dragType !== 'request') ||
    (dropType !== 'folder' && dropType !== 'request') ||
    !project.folders?.[dragPid] ||
    !project.folders?.[dropPid] ||
    drag.value === drop.value || isAncestor(project, drag.value, drop.value)
  ) {
    return false;
  }

  return true;
}

/**
 * Determines if a dimension node drag and drop operation is valid.
 *
 * @param project The project that contains the nodes.
 * @param drag The node that is being dragged (moved).
 * @param drop The node on which the dragged node is dropped.
 * @returns True if move is valid; false otherwise.
 */
function validDimensionMove(project: Project, drag: TreeNodeData, drop: TreeNodeData): boolean {
  const dragId = drag?.value;
  const dropId = drop?.value;
  const dropType = drop?.nodeProps?.type;

  return (
    !!project.dimensions[dragId] &&
    !!project.dimensions[dropId] &&
    dropType === 'dimension' &&
    dragId !== dropId
  );
}

/**
 * Determines if a variant node drag and drop operation is valid.
 *
 * @param project The project that contains the nodes.
 * @param drag The node that is being dragged (moved).
 * @param drop The node on which the dragged node is dropped.
 * @returns True if move is valid; false otherwise.
 */
function validVariantMove(project: Project, drag: TreeNodeData, drop: TreeNodeData): boolean {
  const dragPid = drag?.nodeProps?.parentId;
  const dropPid = drop?.nodeProps?.parentId;
  const dragId = drag?.value;
  const dropId = drop?.value;
  const dropType = drop?.nodeProps?.type;

  return (
    !!project?.variants?.[dragId] &&
    !!project?.variants?.[dropId] &&
    dropType === 'variant' &&
    dragPid === dropPid &&
    dragId !== dropId
  );
}
