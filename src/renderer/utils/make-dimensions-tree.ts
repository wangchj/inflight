import { TreeNodeData } from "@mantine/core";
import { Project } from "types/project";

/**
 * Makes the dimensions tree.
 *
 * @param project The project model object from which to make the tree.
 * @returns The tree nodes.
 */
export default function makeDimensionsTree(project: Project): TreeNodeData[] {
  if (!project || typeof project.dimensions !== 'object') {
    return [];
  }

  return project.dimOrder
    .map(dimId => makeDimensionNode(project, dimId))
    .filter(node => !!node);
}

/**
 * Makes a dimension node.
 *
 * @param project The project of the group.
 * @param dimId The id of the dimension.
 * @returns The dimension node.
 */
function makeDimensionNode(project: Project, dimId: string): TreeNodeData {
  const dim = project.dimensions?.[dimId];

  if (!dim) {
    return;
  }

  return {
    value: dimId,
    label: dim.name,
    children: Array.isArray(dim.variants) ? dim.variants
      .map(variantId => makeVariantNode(project, variantId, dimId))
      .filter(variant => !!variant) : [],
    nodeProps: {
      type: 'dimension',
    }
  }
}

/**
 * Makes a variant node.
 *
 * @param project The project.
 * @param varId The id of the variant.
 * @param dimId The id of the dimension
 * @returns The variant node.
 */
function makeVariantNode(project: Project, varId: string, dimId: string) : TreeNodeData {
  const variant = project.variants[varId];

  if (!variant) {
    return;
  }

  return {
    value: varId,
    label: variant.name,
    nodeProps: {
      type: 'variant',
      parentId: dimId,
    }
  };
}
