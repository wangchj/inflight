import { Group, Menu, RenderTreeNodePayload, TreeNodeData } from "@mantine/core";
import { IconChevronRight, IconDots, IconFolder, IconFolderOpen, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "renderer/redux/store";
import { projectSlice } from "renderer/redux/project-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import MethodIcon from "./method-icon";
import getDescendantRequestIds from "renderer/utils/get-descendant-request-ids";

/**
 * Project tree node component.
 */
export default function TreeNode({payload}: {payload: RenderTreeNodePayload}) {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const {node, level, expanded, selected, hasChildren, elementProps} = payload;

  const pl = `calc(var(--mantine-spacing-sm) + var(--level-offset) * ${level - 1})`;
  const FolderIcon = expanded ? IconFolderOpen : IconFolder;
  const hovered = elementProps['data-hovered'];

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

  /**
   * Handles delete menu item click.
   *
   * @param node The node on which delete is clicked.
   */
  async function onDeleteClick(node: TreeNodeData) {
    switch (node.nodeProps.type) {
      case 'folder':
        const requestIds = getDescendantRequestIds(project, node.value);
        requestIds.forEach(i => dispatch(workspaceSlice.actions.closeRequest(i)));
        dispatch(projectSlice.actions.deleteFolder({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;

      case 'request':
        dispatch(workspaceSlice.actions.closeRequest(node.value));
        dispatch(projectSlice.actions.deleteRequest({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;
    }

    try {
      await window.saveProject(workspace.projectRef.$ref, store.getState().project);
      await window.saveWorkspace(store.getState().workspace);
    }
    catch (error) {
      console.error("Error saving project", error);
    }
  }

  return (
    <Group
      gap={8}
      wrap='nowrap'
      pos="relative"
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

      <div style=
        {{
          position: 'absolute',
          right: '0',
          top: '0.3em',
          display: hovered || menuOpen ? 'block' : 'none'
        }}
      >
        <div style={{
          backgroundColor: selected ? 'var(--mantine-color-gray-1)' : 'white',
          paddingLeft: '0.6em',
          paddingRight: '0.6em',
          overflow: 'hidden'
        }}>
          <Menu
            opened={menuOpen}
            onChange={setMenuOpen}
            shadow="sm"
          >
            <Menu.Target>
              <IconDots size="18px" onClick={e => e.stopPropagation()}/>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size="1em"/>}
                fz="xs"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onDeleteClick(node);
                }}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      </div>
    </Group>
  )
}
