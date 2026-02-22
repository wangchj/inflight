import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconMenu2, IconSend, IconStack2 } from "@tabler/icons-react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { uiSlice } from 'renderer/redux/ui-slice';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import onCloseProject from 'renderer/utils/on-close-project';
import onSave from 'renderer/utils/on-save';

/**
 * The app vertical navigation UI component.
 */
export default function NavBar() {
  const dispatch = useDispatch();
  const ui = useSelector((state: RootState) => state.ui);
  const selectedNavItem = ui.selectedNavItem;

  return (
    <div
      style={{
        backgroundColor: 'var(--body-shade-2)',
        flexGrow: 0,
        flexShrink: 1,
        borderInlineEnd: '1p/x solid var(--mantine-color-default-border)',
        padding: '0.6em'
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap:"1.4em"
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <ActionIcon
            variant={selectedNavItem === 'requests' ? 'filled' : 'subtle'}
            color={selectedNavItem === 'requests' ? 'blue' : 'gray'}
            size="xl"
            onClick={() => dispatch(uiSlice.actions.setSelectedNavItem('requests'))}
          >
            <IconSend/>
          </ActionIcon>

          <Text
            size="0.6em"
          >
            Requests
          </Text>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <ActionIcon
            variant={selectedNavItem === 'dimensions' ? 'filled' : 'subtle'}
            color={selectedNavItem === 'dimensions' ? 'blue' : 'gray'}
            size="xl"
            onClick={() => dispatch(uiSlice.actions.setSelectedNavItem('dimensions'))}
          >
            <IconStack2/>
          </ActionIcon>

          <Text
            size="0.6em"
          >
            Dimensions
          </Text>
        </div>

        {(WIN_BUILD || WEB_BUILD) && <AppMenu/>}
      </div>
    </div>
  )
}

/**
 * Application menu UI component that is only used on Windows and Linux (platforms that do not have
 * application menu at the top of the screen.). This menu should contain the same items as the
 * application menu defined in `index.ts`.
 */
function AppMenu() {
  const dispatch = useDispatch();
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant='subtle' color='gray' size="xl">
          <IconMenu2/>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>File</Menu.Label>
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
