import { TreeNodeData } from "@mantine/core";

/**
 * Gets the resource name based on the resource node type.
 */
export default function resourceName(node: TreeNodeData, isTitle: boolean = false) {
  switch (node?.nodeProps?.type) {
    case 'folder':
      return isTitle ? 'Folder' : 'folder';

    case 'request':
      return isTitle ? 'Request' : 'request';

    case 'dimension':
      return isTitle ? 'Dimension' : 'dimension';

    case 'variant':
      return isTitle ? 'Variant' : 'variant';

    default:
      return isTitle ? 'Resource' : 'resource';
  }
}
