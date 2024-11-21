import { Group, Tree, TreeNodeData } from '@mantine/core';
import { useDispatch, useSelector } from 'react-redux';
import { IconChevronRight } from '@tabler/icons-react';
import { Folder } from 'types/folder';
import { Item } from 'types/item';
import { Project } from 'types/project';
import { TreeNode } from 'types/tree-node';
import { RootState } from 'renderer/redux/store';
import { openRequest } from 'renderer/redux/workspace-slice';

/**
 * Makes Mantine tree node data.
 *
 * @param items The project items.
 * @param path The tree node path to make unique node id.
 * @returns An array of nodes.
 */
function makeData(items: Item[], path: string): TreeNode[] {
  if (!items) {
    return [];
  }

  return items.map(item => {
    const value = path + '/' + item.name;
    const label = item.name;

    const res = {
      value,
      label,
      item
    } as TreeNode;

    if (item.type === 'folder' && (item as Folder).items) {
      const folder = item as Folder;
      res.children = makeData(folder.items, value);
    }

    return res;
  });
}

/**
 * The project tree hierarchy component.
 *
 * @param project The project model object.
 */
export default function ProjectTree() {
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) => state.project);

  /**
   * Handles tree node click/select event.
   *
   * @param node The node that's selected.
   */
  function onSelect(node: TreeNode) {
    if ((node as TreeNode).item.type === 'request') {
      dispatch(openRequest(node));
    }
  }

  return (
    <Tree
      data={makeData(project.items, '')}
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
