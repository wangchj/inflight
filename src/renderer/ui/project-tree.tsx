import { Box, Group, RenderTreeNodePayload, Tree, TreeNodeData, useTree } from '@mantine/core';
import { IconChevronRight, IconFolder, IconFolderOpen } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import MethodIcon from 'renderer/ui/method-icon';
import makeTree from 'renderer/utils/make-tree';

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
   * Handles tree node click/select event.
   *
   * @param node The node that's selected.
   */
  function onSelect(node: TreeNodeData) {
    if (node.nodeProps.type === 'request') {
      dispatch(workspaceSlice.actions.openRequest({
        id: node.value,
        folderId: node.value,
        request: project.requests[node.value]
      }));
    }
  }

  /**
   * Renders a tree node.
   *
   * @returns React element of the node.
   */
  function renderNode(
    {node, level, expanded, hasChildren, elementProps}: RenderTreeNodePayload
  ) {
    const pl = `calc(var(--mantine-spacing-sm) + var(--level-offset) * ${level - 1})`;
    const FolderIcon = expanded ? IconFolderOpen : IconFolder;

    return (
      <Group
        gap={8}
        wrap='nowrap'
        {...elementProps}
        onClick={event => {
          elementProps.onClick(event);
          onSelect(node);
        }}
        pl={pl}
        pr="sm"
        pt="0.2em"
        pb="0.2em"
        fz="sm"
      >
        {hasChildren && (
          <IconChevronRight
            size={16}
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
        )}

        {node.nodeProps.type === 'folder' && <FolderIcon size="1em" opacity={0.8}/>}
        {node.nodeProps.type === 'request' && getRequestIcon(node.value)}

        <div style={{textWrap: 'nowrap', overflow: 'hidden'}}>{node.label}</div>
      </Group>
    )
  }

  /**
   * Makes request icon.
   *
   * @param requestId The request unique id.
   * @returns React element.
   */
  function getRequestIcon(requestId: string) {
    const request = project.requests[requestId];

    return (
      <div style={{display: 'flex', width: '2em', minWidth: '2em', justifyContent: 'flex-end'}}>
        <MethodIcon method={request?.method}/>
      </div>
    )
  }

  return (
    <Box mt="sm" mb="sm">
      <Tree
        data={data}
        tree={tree}
        levelOffset={23}
        selectOnClick
        renderNode={renderNode}
      />
    </Box>
  )
}
