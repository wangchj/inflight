import { Tree, useTree } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import TreeNode from "./tree-node";
import makeDimensionsTree from "renderer/utils/make-dimensions-tree";

export default function DimensionTree() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const data = useMemo(() => makeDimensionsTree(project), [project]);

  const tree = useTree({
    initialExpandedState: workspace.treeExpandedState,
    onNodeExpand: (value: string) => {
      dispatch(workspaceSlice.actions.expandTreeNode(value));
    },
    onNodeCollapse: (value: string) => {
      dispatch(workspaceSlice.actions.collapseTreeNode(value));
    }
  });

  /**
   * Update tree node expanded state from redux store expanded state.
   */
  useEffect(() => {
    const treeState = tree.expandedState;
    const storeState = workspace.treeExpandedState;

    if (treeState && storeState) {
      for (const entry of Object.entries(storeState)) {
        const key = entry[0];

        if (treeState[key] !== undefined && entry[1]) {
          entry[1] ? tree.expand(key) : tree.collapse(key);
        }
      }
    }
  }, [workspace])

  return (
    <Tree
      data={data}
      tree={tree}
      levelOffset={23}
      selectOnClick
      renderNode={payload => <TreeNode payload={payload}/>}
    />
  )
}
