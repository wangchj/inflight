import { ActionIcon, Menu, Text } from '@mantine/core';
import { IconMenu2, IconSend, IconStack2 } from "@tabler/icons-react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { uiSlice } from 'renderer/redux/ui-slice';

export default function NavBar() {
  const dispatch = useDispatch();
  const ui = useSelector((state: RootState) => state.ui);
  const selectedNavItem = ui.selectedNavItem;

  return (
    <div
      style={{
        backgroundColor: 'var(--mantine-color-gray-1)',
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

        {WIN_BUILD && <AppMenu/>}

      </div>
    </div>
  )
}

function AppMenu() {
  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <ActionIcon variant='subtle' color='gray' size="xl"
          // onClick={() => dispatch(uiSlice.actions.setSelectedNavItem('dimensions'))}
        >
          <IconMenu2/>
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>Application</Menu.Label>
        <Menu.Item >
          Settings
        </Menu.Item>
        <Menu.Item >
          Messages
        </Menu.Item>
        <Menu.Item >
          Gallery
        </Menu.Item>
        <Menu.Item
          // leftSection={<IconSearch size={14} />}
          rightSection={
            <Text size="xs" c="dimmed">
              ⌘K
            </Text>
          }
        >
          Search
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
