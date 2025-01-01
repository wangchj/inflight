import { Menu, TreeNodeData } from "@mantine/core";
import { IconDots, IconFolderPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
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

            {(node && deletable) && (
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
