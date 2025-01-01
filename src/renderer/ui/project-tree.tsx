import { Box, RenderTreeNodePayload, Stack, Tree, useTree } from '@mantine/core';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import makeTree from 'renderer/utils/make-tree';
import TreeNode from './tree-node';
import NodeMenu from './node-menu';

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

  /**
   * Renders a tree node.
   *
   * @returns React element of the node.
   */
  function renderNode(payload: RenderTreeNodePayload) {
    return <TreeNode payload={payload}/>
  }

  return (
    <Stack gap="xs">
      <div style={{
        backgroundColor: 'var(--mantine-color-gray-0)',
        paddingInline: '1em',
        paddingBlock: '0.5em',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Box fz="sm">{project.name}</Box>
        <NodeMenu
          node={
            project.folders && project.tree ? {
              value: project.tree,
              label: '',
              nodeProps: {type: 'folder'}
            } : null
          }
          deletable={false}
          hovered={true}
          backgroundColor='var(--mantine-color-gray-0)'
          top="0.6em"
        />
      </div>

      <Box mb="sm">
        <Tree
          data={data}
          tree={tree}
          levelOffset={23}
          selectOnClick
          renderNode={renderNode}
        />
      </Box>
    </Stack>
  )
}
