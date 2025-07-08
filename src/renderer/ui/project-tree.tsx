import { Tree, useTree } from '@mantine/core';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import makeTree from 'renderer/utils/make-tree';
import TreeNode from './tree-node';

/**
 * The project tree hierarchy component.
 *
 * @param project The project model object.
 */
export default function ProjectTree() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const data = useMemo(() => makeTree(project, project.tree), [project]);

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
      style={{
        height: '100%',
        overflow: 'hidden'
      }}
      data={data}
      tree={tree}
      levelOffset={23}
      selectOnClick
      renderNode={payload => <TreeNode payload={payload}/>}
    />
  )
}
