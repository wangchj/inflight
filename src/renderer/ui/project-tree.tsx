import { Group, Tree, useTree } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Folder } from 'types/folder';
import { Project } from 'types/project';
import { TreeNode } from 'types/tree-node';
import { RootState } from 'renderer/redux/store';
import { workspaceSlice } from 'renderer/redux/workspace-slice';

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

  return (
    <Tree
      data={data}
      tree={tree}
      levelOffset={23}
      selectOnClick
      renderNode={({ node, expanded, hasChildren, elementProps }) => (

        <Group
          gap={5}
          {...elementProps}
          onClick={event => {
            elementProps.onClick(event);
            onSelect(node as TreeNode);
          }}
        >
          {hasChildren && (
            <IconChevronRight
              size={18}
              style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
            />
          )}
          <span>{node.label}</span>
        </Group>

      )}
    />
  )
}
