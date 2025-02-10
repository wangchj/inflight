import { Button, Group, Stack, Title } from "@mantine/core";
import { notifications } from '@mantine/notifications';
import { IconFileSpark, IconFolderOpen, IconSend } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Persistence from "renderer/utils/persistence";

/**
 * The UI that's shown when no project is open.
 */
export default function NoProject() {
  const dispatch = useDispatch();

  /**
   * Handles New Project button click event.
   */
  async function newProject() {
    notifications.clean();

    try {
      const path = await window.showNewProjectDialog();
      const project = await Persistence.openProject(path);

      if (project) {
        dispatch(projectSlice.actions.setProject(project));
        dispatch(workspaceSlice.actions.openProject(path));
      }
    }
    catch (error) {
      notifications.show({
        id: 'newProject',
        color: 'red',
        title: 'Unable to create new project',
        message: (error instanceof Error ? error.message : String(error)),
        withBorder: true,
      });
    }
  }

  /**
   * Handles Open Project button click event.
   */
  async function openProject() {
    notifications.clean();

    try {
      const path = await window.showOpenProjectDialog();
      const project = await Persistence.openProject(path);

      if (project) {
        dispatch(projectSlice.actions.setProject(project));
        dispatch(workspaceSlice.actions.openProject(path));
      }
    }
    catch (error) {
      notifications.show({
        id: 'openProject',
        color: 'red',
        title: 'Unable to open project',
        message: (error instanceof Error ? error.message : String(error)),
        withBorder: true,
      });
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Stack
        align="center"
        gap="xl"
      >
        <Title>
          <Group>
            <IconSend size="1em"/> Welcome to Fetch
          </Group>
        </Title>

        <Stack>
          <Button
            variant="transparent"
            justify="left"
            leftSection={<IconFileSpark/>}
            onClick={newProject}
          >
            New Project
          </Button>

          <Button
            variant="transparent"
            justify="left"
            leftSection={<IconFolderOpen/>}
            onClick={openProject}
          >
            Open Project
          </Button>
        </Stack>
      </Stack>
    </div>
  )
}
