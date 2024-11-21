import { TreeNodeData } from "@mantine/core";
import { Item } from "./item";

export interface TreeNode extends TreeNodeData {
  item: Item;
}
