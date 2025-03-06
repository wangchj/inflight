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

    case 'envGroup':
      return isTitle ? 'Environment Group' : 'environment group';

    case 'env':
      return isTitle ? 'Environment Group' : 'environment group';

    default:
      return isTitle ? 'Resource' : 'resource';
  }
}
