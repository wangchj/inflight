import { Button, Code, Group, Popover, Table, Text } from '@mantine/core';
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { uiSlice } from 'renderer/redux/ui-slice';

/**
 * The app title bar UI component.
 */
export default function TitleBar() {
  const project = useSelector((state: RootState) => state.project);
  const workspace = useSelector((state: RootState) => state.workspace);
  const dispatch = useDispatch();

  /**
   * Determines if the popover is open.
   */
  const [popped, setPopped] = useState<boolean>(false);

  /**
   * Handles project name edit button click event.
   */
  function onEditClick() {
    setPopped(false);
    dispatch(uiSlice.actions.openRenameModal('project'));
  }

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
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Group gap="sm">
        <Text size="sm">{project.name}</Text>
        <Popover
          width={400}
          position="bottom"
          withArrow shadow="md"
          opened = {popped}
          onChange={open => !open && setPopped(false)}
        >
          <Popover.Target>
            <IconChevronDown
              size="0.85em"
              className="no-app-drag"
              onClick={() => setPopped(!popped)}
            />
          </Popover.Target>
          <Popover.Dropdown>
            <Table withRowBorders={false}>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Td>{project.name}
                  <Button
                    variant="transparent"
                    size="xs"
                    onClick={onEditClick}
                  >Edit</Button>
                </Table.Td>
              </Table.Tr>

              <Table.Tr>
                <Table.Th>Path</Table.Th>
                <Table.Td style={{overflowWrap: 'anywhere'}}>
                  <Code>{workspace.projectPath}</Code>
                </Table.Td>
              </Table.Tr>
            </Table>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </div>
  )
}
