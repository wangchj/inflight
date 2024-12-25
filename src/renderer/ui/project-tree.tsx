import { Box, Group, RenderTreeNodePayload, Tree, useTree } from '@mantine/core';
import { IconChevronRight, IconFolder, IconFolderOpen } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Folder } from 'types/folder';
import { Project } from 'types/project';
import { TreeNode } from 'types/tree-node';
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import MethodIcon from 'renderer/ui/method-icon';

/**
 * Makes Mantine tree node data.
 *
 * @param items The project items.
 * @param path The tree node path to make unique node id.
 * @returns An array of nodes.
 */
function makeData(project: Project, folder: Folder, path: string): TreeNode[] {
  if (!folder) {
    return [];
  }

  // Make folder nodes
  const folderNodes = folder.folders ? folder.folders.map(subfolder => ({
    type: 'folder',
    value: `${path}/${subfolder.name}`,
    label: subfolder.name,
    children: makeData(project, subfolder, `${path}/${subfolder.name}`),
  })) as TreeNode[] : [];

  // Make request nodes
  const requestNodes = folder.requests ? folder.requests.map(requestId => {
    const request = project?.requests[requestId];

    if (!request) {
      return;
    }

    return {
      type: 'request',
      value: requestId,
      label: request.name,
    }
  }).filter(node => !!node) as TreeNode[] : [];

  return [...folderNodes, ...requestNodes];
}

/**
 * The project tree hierarchy component.
 *
 * @param project The project model object.
 */
export default function ProjectTree() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const data = useMemo(() => makeData(project, project.tree, ''), [project]);
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
  function onSelect(node: TreeNode) {
    if (node.type === 'request') {
      dispatch(workspaceSlice.actions.openRequest({
        id: node.value,
        request: project.requests[node.value]
      }));
    }
  }

  function renderNode(
    {node, level, expanded, hasChildren, elementProps}: RenderTreeNodePayload
  ) {
    const treeNode = node as TreeNode;
    const pl = `calc(var(--mantine-spacing-sm) + var(--level-offset) * ${level - 1})`;
    const FolderIcon = expanded ? IconFolderOpen : IconFolder;

    return (
      <Group
        gap={8}
        {...elementProps}
        onClick={event => {
          elementProps.onClick(event);
          onSelect(treeNode);
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

        {treeNode.type === 'folder' && <FolderIcon size="1em" opacity={0.8}/>}
        {treeNode.type === 'request' && getRequestIcon(node.value)}

        <span>{node.label}</span>
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
      <div style={{display: 'flex', width: '2em', justifyContent: 'flex-end'}}>
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
