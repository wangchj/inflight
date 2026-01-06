import { ActionIcon, Text } from '@mantine/core';
import { IconSend, IconStack2 } from "@tabler/icons-react";
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
      </div>
    </div>
  )
}
