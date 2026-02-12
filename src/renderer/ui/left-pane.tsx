import { Menu } from '@mantine/core';
import {
  IconFolderPlus,
  IconStack2,
} from "@tabler/icons-react";
import { MouseEvent, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { NavItem, uiSlice } from 'renderer/redux/ui-slice';
import DimensionTree from './dimension-tree';
import ProjectTree from './project-tree';

/**
 * Gets the tree element to render.
 *
 * @param selectedNavItem The selected nav item.
 * @returns The tree element.
 */
function getTree(selectedNavItem: NavItem) {
  switch (selectedNavItem) {
    case 'requests':
      return <ProjectTree />

    case 'dimensions':
      return <DimensionTree />
  }
}

/**
 * The project tree hierarchy component.
 *
 * @param project The project model object.
 */
export default function LeftPane() {
  /**
   * The ui-slice redux state.
   */
  const ui = useSelector((state: RootState) => state.ui);

  /**
   * Determines if the context menu is open.
   */
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * The menu position.
   */
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  /**
   * Handles onContextMenu event.
   *
   * @param event The event object.
   */
  function onContextMenu(event: MouseEvent) {
    setMenuPos({ x: event.clientX, y: event.clientY + 8 });
    setMenuOpen(true);
    event.stopPropagation();
  }

  /**
   * Gets the context menu React element based on selected nav item.
   *
   * @returns The React element.
   */
  function getContextMenu() {
    switch (ui.selectedNavItem) {
      case 'requests':
        return <RequestsContextMenu/>

      case 'dimensions':
        return <DimensionsContextMenu/>
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--mantine-color-gray-0)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 'var(--mantine-spacing-xs)',
        paddingBlockStart: '1em',
      }}
      onContextMenu={onContextMenu}
    >
      <div
        style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}
      >
        {getTree(ui.selectedNavItem)}
      </div>

      <Menu
        opened={menuOpen}
        onChange={open => !open && setMenuOpen(open)}
        shadow='sm'
      >
        <Menu.Target>
          <div
            style={{
              position: 'fixed',
              left: menuPos.x,
              top: menuPos.y,
              width: 0,
              height: 0,
            }}
          />
        </Menu.Target>
        {getContextMenu()}
      </Menu>
    </div>
  )
}

/**
 * Requests context menu React component.
 */
function RequestsContextMenu() {
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) => state.project);

  /**
   * Handles new folder menu item click event.
   */
  function onNewFolderClick() {
    dispatch(uiSlice.actions.openNewFolderModal(project.tree));
  }

  return (
    <Menu.Dropdown>
      <Menu.Item
        leftSection={<IconFolderPlus size="1em"/>}
        fz="xs"
        onClick={(e: any) => {
          e.stopPropagation();
          onNewFolderClick();
        }}
      >
        New Folder
      </Menu.Item>
    </Menu.Dropdown>
  )
}

/**
 * Dimensions context menu React component.
 */
function DimensionsContextMenu() {
  const dispatch = useDispatch();

  /**
   * Handles new dimension menu item click event.
   *
   */
  function onNewDimensionClick() {
    dispatch(uiSlice.actions.openNewDimensionModal());
  }

  return (
    <Menu.Dropdown>
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
    </Menu.Dropdown>
  )
}
