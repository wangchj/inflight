import { ActionIcon } from '@mantine/core';
import { Button } from '@mantine/core';
import { IconMenu2 } from "@tabler/icons-react";

/**
 * The app title bar UI component.
 */
export default function TitleBar() {
  return (
    <div
      className="app-drag"
      style={{
        height: '2rem',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: 'var(--mantine-color-gray-1)',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* {WIN_BUILD && <Menu/>} */}
    </div>
  )
}

function Menu() {
  return (
    <div
      className="no-app-drag"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActionIcon variant="subtle" color="gray" aria-label="Settings" w="70px" radius={0}>
        <IconMenu2/>
      </ActionIcon>
    </div>
  )
}
