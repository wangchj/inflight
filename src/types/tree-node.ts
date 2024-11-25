import { TreeNodeData } from "@mantine/core";

export interface TreeNode extends TreeNodeData {
  type: 'folder' | 'request';
}
