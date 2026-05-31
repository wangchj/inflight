import { Menu, Text, UnstyledButton } from '@mantine/core';
import { useDispatch } from 'react-redux';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import onCloseProject from 'renderer/utils/on-close-project';
import onSave from 'renderer/utils/on-save';
import "./app-menu.css";

/**
 * Application menu UI component that is only used on Windows and Linux (platforms that do not have
 * application menu at the top of the screen.). This menu should contain the same items as the
 * application menu defined in `index.ts`.
 */
export function AppMenuBar() {
  return (
    <div className="app-menu-bar">
      <FileMenu/>
    </div>
  )
}

/**
 * The File menu UI component.
 */
function FileMenu() {
  const dispatch = useDispatch();
  return (
    <Menu
      shadow="md"
      width={200}
      position="bottom-start"
    >
      <Menu.Target>
        <UnstyledButton
          className="no-app-drag menu-trigger"
        >
          <Text size="sm">File</Text>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          rightSection={
            <Text size="xs" c="dimmed">
              Ctrl+S
            </Text>
          }
          onClick={() => onSave()}
        >
          Save
        </Menu.Item>

        <Menu.Item
          rightSection={
            <Text size="xs" c="dimmed">
              Ctrl+W
            </Text>
          }
          onClick={() => dispatch(workspaceSlice.actions.closeResource())}
        >
          Close Tab
        </Menu.Item>

        <Menu.Item
          onClick={() => onCloseProject()}
        >
          Close Project
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
