import { Tree, useTree } from "@mantine/core";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import TreeNode from "./tree-node";
import makeEnvTree from "renderer/utils/make-env-tree";

export default function EnvTree() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const data = useMemo(() => makeEnvTree(project), [project]);

  const tree = useTree({
    initialExpandedState: workspace.treeExpandedState,
    onNodeExpand: (value: string) => {
      dispatch(workspaceSlice.actions.expandTreeNode(value));
    },
    onNodeCollapse: (value: string) => {
      dispatch(workspaceSlice.actions.collapseTreeNode(value));
    }
  });

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
