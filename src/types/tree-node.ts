import { TreeNodeData } from "@mantine/core";
import { Folder } from "types/folder";

export interface TreeNode extends TreeNodeData {
  type: 'folder' | 'request';
  parentFolder: Folder;
}
