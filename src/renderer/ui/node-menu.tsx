import { Menu, TreeNodeData } from "@mantine/core";
import {
  IconCopy,
  IconCursorText,
  IconDots,
  IconFolderPlus,
  IconLayersSelected,
  IconStack2,
  IconTrash
} from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { uiSlice } from "renderer/redux/ui-slice";

interface NodeMenuProps {
  node?: TreeNodeData;
  deletable?: boolean;
  hovered: boolean;
  backgroundColor?: string;
  top?: string;
}

export default function NodeMenu({node, deletable, hovered, backgroundColor, top}: NodeMenuProps) {
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const root = node?.nodeProps?.root;

  /**
   * Handles delete menu item click.
   *
   * @param node The node on which delete is clicked.
   */
  async function onDeleteClick(node: TreeNodeData) {
    dispatch(uiSlice.actions.openDeleteModal(node));
  }

  /**
   * Handles new folder menu item click event.
   *
   * @param node The node on which it's clicked.
   */
  async function onNewFolderClick(node: TreeNodeData) {
    if (node.nodeProps.type === 'folder') {
      dispatch(uiSlice.actions.openNewFolderModal(node.value));
    }
  }

  /**
   * Handles new dimension menu item click event.
   *
   */
  async function onNewDimensionClick() {
    dispatch(uiSlice.actions.openNewDimensionModal());
  }

  /**
   * Handles new variant menu item click event.
   *
   * @param node The dimension node on which it's clicked.
   */
  async function onNewVariantClick(node: TreeNodeData) {
    dispatch(uiSlice.actions.openNewVariantModal(node.value));
  }

  /**
   * Handles duplicate menu item click event.
   *
   * @param node The node on which duplicate is clicked.
   */
  function onDuplicateClick(node: TreeNodeData) {
    if (!node?.value || !node?.nodeProps?.type) {
      return;
    }

    switch (node.nodeProps.type) {
      case 'request':
        dispatch(projectSlice.actions.duplicateRequest({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;

      case 'variant':
        dispatch(projectSlice.actions.duplicateVariant({
          id: node.value,
          dimId: node.nodeProps.parentId
        }));
        break;
    }
  }

  /**
   * Handles rename menu item click event.
   *
   * @param node The node to rename.
   */
  function onRenameClick(node: TreeNodeData) {
    dispatch(uiSlice.actions.openRenameModal(node));
  }

  return (
    <div style=
      {{
        position: 'absolute',
        right: '0',
        top: top,
        display: hovered || menuOpen ? 'block' : 'none'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: backgroundColor ?? 'transparent',
        paddingInline: '0.6em',
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

            {node.nodeProps.type === 'folder' && (
              <Menu.Item
                leftSection={<IconFolderPlus size="1em"/>}
                fz="xs"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onNewFolderClick(node);
                }}
              >
                New Folder
              </Menu.Item>
            )}

            {(!root && (node.nodeProps.type === 'request' || node.nodeProps.type === 'variant')) && (
              <Menu.Item
                leftSection={<IconCopy size="1em"/>}
                fz="xs"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onDuplicateClick(node);
                }}
              >
                Duplicate
              </Menu.Item>
            )}

            {root && node.nodeProps.type === 'variant' && (
              <Menu.Item
                leftSection={<IconStack2 size="1em"/>}
                fz="xs"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onNewDimensionClick();
                }}
              >
                New Dimension
              </Menu.Item>
            )}

            {node.nodeProps.type === 'dimension' && (
              <Menu.Item
                leftSection={<IconLayersSelected size="1em"/>}
                fz="xs"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onNewVariantClick(node);
                }}
              >
                New Variant
              </Menu.Item>
            )}

            {(node && !root) && (
              <Menu.Item
                leftSection={<IconCursorText size="1em"/>}
                fz="xs"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onRenameClick(node);
                }}
              >
                Rename
              </Menu.Item>
            )}

            {(node && !root) && (
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
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  )
}
